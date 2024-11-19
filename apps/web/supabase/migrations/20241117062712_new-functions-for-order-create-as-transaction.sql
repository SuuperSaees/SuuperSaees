drop policy "orders_insert" on "public"."orders_v2";

-- Check and add 'orders.write', 'orders.read', etc. to the app_permissions enum if not already present
DO $$
BEGIN
    -- Add 'orders.write' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'orders.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'orders.write';
    END IF;

    -- Add 'orders.read' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'orders.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'orders.read';
    END IF;

    -- Add 'orders.manage' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'orders.manage' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'orders.manage';
    END IF;

    -- Add 'orders.delete' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'orders.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'orders.delete';
    END IF;
END $$;

COMMIT;


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

  -- Step 0.3: Get client data
  SELECT * INTO client_data
  FROM public.clients
  WHERE user_client_id = current_user_id
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
  WHERE status_name = 'pending'
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
  _order := jsonb_set(_order, '{customer_id}', to_jsonb(current_user_id::text));
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
    COALESCE(_order->>'status', 'pending'),
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
    all_followers := array_append(_order_followers, current_user_id::text);  -- Add the current user as initial follower
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

CREATE OR REPLACE FUNCTION public.is_user_in_agency_organization(user_id uuid, target_organization_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.accounts_memberships am
    WHERE am.user_id = is_user_in_agency_organization.user_id  -- Use the table alias to reference the table's column
      AND am.account_id = target_organization_id
      AND am.account_role IN ('agency_owner', 'agency_project_manager', 'agency_member')
  );
END;$function$
;

CREATE OR REPLACE FUNCTION public.is_user_in_client_organization(user_id uuid, target_organization_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$begin
  return exists (
    select 1
    from public.accounts_memberships am
    where am.user_id = is_user_in_client_organization.user_id
      and am.account_id = target_organization_id
      and am.account_role in ('client_owner', 'client_member')
  );
end;$function$
;

create policy "Allow authorized users to create orders"
on "public"."orders_v2"
as permissive
for insert
to authenticated
with check (((auth.uid() IS NOT NULL) AND ((is_user_in_agency_organization(auth.uid(), agency_id) AND has_permission(auth.uid(), agency_id, 'orders.write'::app_permissions)) OR (is_user_in_client_organization(auth.uid(), client_organization_id) AND has_permission(auth.uid(), client_organization_id, 'orders.write'::app_permissions)))));

GRANT EXECUTE ON FUNCTION public.create_order(jsonb, jsonb[], text[], uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_in_agency_organization(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_in_client_organization(uuid, uuid) TO authenticated;