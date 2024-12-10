alter table "public"."orders_v2" alter column "status" set default 'in_review'::text;

CREATE OR REPLACE FUNCTION public.create_order(_order jsonb, _brief_responses jsonb[], _order_followers text[], _order_file_ids uuid[])
 RETURNS orders_v2
 LANGUAGE plpgsql
AS $function$DECLARE
  new_order public.orders_v2;  -- Declare new_order as a record of type orders_v2
  current_user_id uuid := auth.uid();  -- Get the authenticated user's ID
  user_role text;  -- To store the current user's role
  account_data record;  -- To hold account data
  client_data record;  -- To hold client data
  agency_organization_data record;  -- To hold agency organization data
  agency_client_id uuid;  -- To hold the agency client ID
  client_organization_id uuid;  -- To hold the client organization ID
  brief_ids uuid[];  -- Array to hold brief IDs
  agencyRoles text[] := ARRAY['agency_owner', 'agency_member', 'agency_project_manager'];  -- List of agency roles
  clientRoles text[] := ARRAY['client_owner', 'client_member'];  -- List of client roles
  all_followers text[];  -- Array to hold all followers
  default_status_id integer;  -- To hold the default status ID
BEGIN
  -- Step 0: Verify the user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User is not authenticated';
  END IF;

  -- Step 0.1: Get the current user role
  SELECT am.account_role INTO user_role
  FROM public.accounts_memberships AS am  -- Use an alias for clarity
  WHERE am.user_id = current_user_id
  LIMIT 1;

  -- Step 0.2: Get account data
  SELECT * INTO account_data
  FROM public.accounts
  WHERE id = current_user_id
  LIMIT 1;

  -- Step 0.3.1: Check _order_followers and use its first value if it exists
  IF array_length(_order_followers, 1) IS NULL THEN
    _order_followers := ARRAY[current_user_id];  -- Default to current_user_id if _order_followers is empty
  END IF;

 -- Step 0.3.2: Get client data using the first value of _order_followers if present
  SELECT * INTO client_data
  FROM public.clients
  WHERE user_client_id = COALESCE(_order_followers[1]::uuid, current_user_id)  -- Use the first _order_followers value if it exists
  LIMIT 1;

  -- Step 0.4: Determine agencyClientId and clientOrganizationId
  agency_client_id := COALESCE(client_data.agency_id, account_data.organization_id);
  client_organization_id := COALESCE(client_data.organization_client_id, account_data.organization_id);

  -- Step 0.5: Get agency organization data
  SELECT id, primary_owner_user_id, name INTO agency_organization_data
  FROM public.accounts
  WHERE id = agency_client_id
  LIMIT 1;

  -- Step 0.6: Get default status ID
  SELECT id INTO default_status_id
  FROM public.agency_statuses
  WHERE status_name = 'in_review'
  AND agency_id = agency_organization_data.id
  LIMIT 1;

  -- Step 0.7: If no status found, set default status_id to 1
  IF default_status_id IS NULL THEN
    default_status_id := 1;
  END IF;

  -- Step 0.8: Prepare the order for insertion
  brief_ids := ARRAY(
    SELECT (response_item->>'brief_id')::uuid
    FROM unnest(_brief_responses) AS response_item
  );

  -- Construct the orderToInsert object
  _order := jsonb_set(_order, '{customer_id}', to_jsonb(COALESCE(_order_followers[1]::uuid, current_user_id::uuid)));
  _order := jsonb_set(_order, '{client_organization_id}', to_jsonb(client_organization_id::text));
  _order := jsonb_set(_order, '{propietary_organization_id}', to_jsonb(agency_organization_data.primary_owner_user_id::text));
  _order := jsonb_set(_order, '{agency_id}', to_jsonb(agency_organization_data.id::text));
  _order := jsonb_set(_order, '{brief_ids}', to_jsonb(brief_ids));

  -- Step 1: Insert the order into orders_v2
  INSERT INTO public.orders_v2 (
    agency_id,
    brief_ids,
    client_organization_id,
    created_at,
    customer_id,
    description,
    due_date,
    priority,
    propietary_organization_id,
    status,
    title,
    uuid,
    status_id
  )
  VALUES (
    COALESCE(NULLIF(_order->>'agency_id', '')::uuid, NULL),
    COALESCE(
      ARRAY(
        SELECT elem::uuid
        FROM jsonb_array_elements_text(_order->'brief_ids') AS elem
      ),
      '{}'::uuid[]
    ),
    (_order->>'client_organization_id')::uuid,
    NOW(),
    (_order->>'customer_id')::uuid,
    _order->>'description',
    COALESCE(NULLIF(_order->>'due_date', ''), NULL)::timestamp with time zone,
    COALESCE(_order->>'priority', 'low')::priority_types,
    (_order->>'propietary_organization_id')::uuid,
    COALESCE(_order->>'status', 'in_review'),
    _order->>'title',
    _order->>'uuid',
    default_status_id
  )
  RETURNING * INTO new_order;

  -- Step 2: Insert brief responses if present
  IF _brief_responses IS NOT NULL AND array_length(_brief_responses, 1) > 0 THEN
    INSERT INTO public.brief_responses (
      order_id,
      form_field_id,
      brief_id,
      response
    )
    SELECT
      new_order.uuid,
      (response_item->>'form_field_id')::uuid,
      (response_item->>'brief_id')::uuid,
      response_item->>'response'
    FROM unnest(_brief_responses) AS response_item;
  END IF;

  -- Step 3: Insert order files if present
  IF _order_file_ids IS NOT NULL AND array_length(_order_file_ids, 1) > 0 THEN
    INSERT INTO public.order_files (
      order_id,
      file_id
    )
    SELECT
      new_order.uuid,
      file_id
    FROM unnest(_order_file_ids) AS file_id;
  END IF;

  -- Step 4: Assign agency members to the order if role matches
  IF user_role = ANY (agencyRoles) THEN
    INSERT INTO public.order_assignations (
      agency_member_id,
      order_id
    )
    VALUES (
      current_user_id,  -- Use the authenticated user's ID
      new_order.id
    );
  END IF;

  -- Step 5: Determine initial follower based on client role and insert order followers
  IF user_role = ANY (clientRoles) THEN
    -- Only append _order_followers[1] if it is not already in the array
    all_followers := ARRAY(
      SELECT DISTINCT unnest(array_append(_order_followers, COALESCE(_order_followers[1]::text, current_user_id::text)))
    );
  ELSE
    all_followers := _order_followers;  -- Use provided followers if no client role
  END IF;

  -- Step 6: Insert all followers if present
  IF array_length(all_followers, 1) > 0 THEN
    INSERT INTO public.order_followers (
      order_id,
      client_member_id
    )
    SELECT
      new_order.id,
      follower_id::uuid  -- Convert each follower to uuid
    FROM unnest(all_followers) AS follower_id;
  END IF;

  -- Return the newly created order record
  RETURN new_order;
END;$function$
;


