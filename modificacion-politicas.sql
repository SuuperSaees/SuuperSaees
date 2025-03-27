-- Modificar políticas para la tabla clients
ALTER POLICY "create_client" ON "public"."clients"
USING (true)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  propietary_organization_id = (
    SELECT organization_id FROM public.accounts 
    WHERE id = auth.uid()
  )
);

ALTER POLICY "Enable read access for all authenticated users" ON "public"."clients"
USING (
  auth.uid() IS NOT NULL AND (
    propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    ) OR
    public.has_role_on_account(auth.uid())
  )
);

-- Modificar políticas para la tabla orders_v2
ALTER POLICY "orders_create" ON "public"."orders_v2"
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  propietary_organization_id = (
    SELECT organization_id FROM public.accounts 
    WHERE id = auth.uid()
  )
);

ALTER POLICY "orders_delete" ON "public"."orders_v2"
USING (
  auth.uid() IS NOT NULL AND 
  propietary_organization_id = (
    SELECT organization_id FROM public.accounts 
    WHERE id = auth.uid()
  )
);

ALTER POLICY "orders_select" ON "public"."orders_v2"
USING (
  auth.uid() IS NOT NULL AND (
    propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    ) OR
    public.has_role_on_account(auth.uid())
  )
);

ALTER POLICY "orders_update" ON "public"."orders_v2"
USING (
  auth.uid() IS NOT NULL AND (
    propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    ) OR
    public.has_role_on_account(auth.uid())
  )
);

-- Modificar políticas para la tabla services
ALTER POLICY "create_service" ON "public"."services"
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  propietary_organization_id = (
    SELECT organization_id FROM public.accounts 
    WHERE id = auth.uid()
  )
);

ALTER POLICY "delete_service" ON "public"."services"
USING (
  auth.uid() IS NOT NULL AND 
  propietary_organization_id = (
    SELECT organization_id FROM public.accounts 
    WHERE id = auth.uid()
  )
);

ALTER POLICY "select_service" ON "public"."services"
USING (
  auth.uid() IS NOT NULL AND (
    propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    ) OR
    public.has_role_on_account(auth.uid())
  )
);

ALTER POLICY "update_service" ON "public"."services"
USING (
  auth.uid() IS NOT NULL AND (
    propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    ) OR
    public.has_role_on_account(auth.uid())
  )
); 


-- Modificar políticas para la tabla briefs
ALTER POLICY "Create brief" ON "public"."briefs"
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  propietary_organization_id = (
    SELECT organization_id FROM public.accounts 
    WHERE id = auth.uid()
  )
);

ALTER POLICY "Delete brief" ON "public"."briefs"
USING (
  auth.uid() IS NOT NULL AND 
  propietary_organization_id = (
    SELECT organization_id FROM public.accounts 
    WHERE id = auth.uid()
  )
);

ALTER POLICY "Read brief" ON "public"."briefs"
USING (
  auth.uid() IS NOT NULL AND (
    propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    ) OR
    public.has_role_on_account(auth.uid())
  )
);

ALTER POLICY "Update brief" ON "public"."briefs"
USING (
  auth.uid() IS NOT NULL AND (
    propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    ) OR
    public.has_role_on_account(auth.uid())
  )
);

-- Modificar políticas para tablas de actividades y mensajes
ALTER POLICY "Create for all authenticated users" ON "public"."activities"
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.orders_v2
    WHERE orders_v2.id = order_id AND
    orders_v2.propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    )
  )
);

ALTER POLICY "Create for all authenticated users" ON "public"."messages"
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.orders_v2
    WHERE orders_v2.id = order_id AND
    orders_v2.propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    )
  )
);

ALTER POLICY "Create for all authenticated users" ON "public"."reviews"
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.orders_v2
    WHERE orders_v2.id = order_id AND
    orders_v2.propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    )
  )
);

-- Modificar políticas para la tabla files
ALTER POLICY "Create for all authenticated users" ON "public"."files"
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    message_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.messages
      JOIN public.orders_v2 ON messages.order_id = orders_v2.id
      WHERE messages.id = message_id AND
      orders_v2.propietary_organization_id = (
        SELECT organization_id FROM public.accounts 
        WHERE id = auth.uid()
      )
    )
  )
);

-- Modificar políticas para la tabla form_fields
ALTER POLICY "Create to all authenticated users" ON "public"."form_fields"
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Modificar políticas para la tabla brief_form_fields
ALTER POLICY "Create to all authenticated users" ON "public"."brief_form_fields"
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.briefs
    WHERE briefs.id = brief_id AND
    briefs.propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    )
  )
);

-- Modificar políticas para la tabla brief_responses
ALTER POLICY "Create to all authenticated users" ON "public"."brief_responses"
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.briefs
    WHERE briefs.id = brief_id AND
    briefs.propietary_organization_id = (
      SELECT organization_id FROM public.accounts 
      WHERE id = auth.uid()
    )
  )
);

-- Modificar la función has_role_on_account para incluir verificación de organización
CREATE OR REPLACE FUNCTION public.has_role_on_account(user_id uuid, account_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_organization_id text;
  account_organization_id text;
BEGIN
  -- Obtener el organization_id del usuario
  SELECT organization_id INTO user_organization_id
  FROM public.accounts
  WHERE id = user_id;
  
  -- Si se proporciona account_id, verificar si pertenece a la misma organización
  IF account_id IS NOT NULL THEN
    SELECT organization_id INTO account_organization_id
    FROM public.accounts
    WHERE id = account_id;
    
    -- Si pertenecen a la misma organización, permitir acceso
    IF user_organization_id = account_organization_id THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- Verificar si el usuario tiene un rol en la cuenta
  RETURN EXISTS (
    SELECT 1
    FROM public.accounts_memberships
    WHERE user_id = $1
    AND account_id = COALESCE($2, (SELECT auth.uid()))
  );
END;
$$;

-- Modificar la función has_permission para incluir verificación de organización
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, account_id uuid, permission app_permissions)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_organization_id text;
  account_organization_id text;
  user_role varchar;
BEGIN
  -- Obtener el organization_id del usuario
  SELECT organization_id INTO user_organization_id
  FROM public.accounts
  WHERE id = user_id;
  
  -- Obtener el organization_id de la cuenta
  SELECT organization_id INTO account_organization_id
  FROM public.accounts
  WHERE id = account_id;
  
  -- Si pertenecen a la misma organización, permitir acceso
  IF user_organization_id = account_organization_id THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar permisos basados en roles
  SELECT account_role INTO user_role
  FROM public.accounts_memberships
  WHERE user_id = $1
  AND account_id = $2;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1
    FROM public.role_permissions
    WHERE role = user_role
    AND permission = $3
  );
END;
$$;


-- Modificar la función team_account_workspace para incluir organization_id
CREATE OR REPLACE FUNCTION public.team_account_workspace(account_slug text)
RETURNS TABLE(
  id uuid, 
  name character varying, 
  picture_url character varying, 
  slug text, 
  role character varying, 
  role_hierarchy_level integer, 
  primary_owner_user_id uuid, 
  subscription_status subscription_status, 
  permissions app_permissions[],
  organization_id text
)
LANGUAGE plpgsql
AS $function$
begin
    return QUERY
    select
        accounts.id,
        accounts.name,
        accounts.picture_url,
        accounts.slug,
        accounts_memberships.account_role,
        roles.hierarchy_level,
        accounts.primary_owner_user_id,
        subscriptions.status,
        array_agg(DISTINCT role_permissions.permission),
        accounts.organization_id
    from
        accounts
        join accounts_memberships on accounts.id = accounts_memberships.account_id
        left join roles on accounts_memberships.account_role = roles.name
        left join role_permissions on roles.name = role_permissions.role
        left join subscriptions on accounts.id = subscriptions.account_id
    where
        accounts.slug = account_slug
        and accounts_memberships.user_id = auth.uid()
    group by
        accounts.id,
        accounts.name,
        accounts.picture_url,
        accounts.slug,
        accounts_memberships.account_role,
        roles.hierarchy_level,
        accounts.primary_owner_user_id,
        subscriptions.status;
end;
$function$;

-- Modificar la vista user_account_workspace para incluir organization_id
CREATE OR REPLACE VIEW "public"."user_account_workspace" 
WITH (security_invoker = true)
AS SELECT 
    accounts.id,
    accounts.name,
    accounts.picture_url,
    accounts.organization_id,
    ( SELECT subscriptions.status
        FROM subscriptions
        WHERE (subscriptions.account_id = accounts.id)
        LIMIT 1) AS subscription_status
FROM accounts
WHERE ((accounts.primary_owner_user_id = ( SELECT auth.uid() AS uid)) AND (accounts.is_personal_account = true))
LIMIT 1;

-- Modificar la vista user_accounts para incluir organization_id
CREATE OR REPLACE VIEW "public"."user_accounts" 
WITH (security_invoker = true) 
AS SELECT 
    account.id,
    account.name,
    account.picture_url,
    account.slug,
    account.organization_id,
    membership.account_role AS role
FROM (accounts account
    JOIN accounts_memberships membership ON ((account.id = membership.account_id)))
WHERE ((membership.user_id = ( SELECT auth.uid() AS uid)) AND (account.is_personal_account = false) AND (account.id IN ( SELECT accounts_memberships.account_id
        FROM accounts_memberships
        WHERE (accounts_memberships.user_id = ( SELECT auth.uid() AS uid)))));

        -- Modificar la función handle_new_account_credits_usage para considerar organization_id
CREATE OR REPLACE FUNCTION kit.handle_new_account_credits_usage()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
DECLARE
  accounts_count integer;
BEGIN
  -- collect the number of accounts the user has
  SELECT count (*) FROM public.accounts
  WHERE public.accounts.primary_owner_user_id = new.primary_owner_user_id
  AND public.accounts.is_personal_account = false
  AND public.accounts.organization_id = new.organization_id
  INTO accounts_count;

  -- insert a new row in the credits_usage table
  INSERT INTO public.credits_usage (account_id, remaining_credits)
  VALUES (
    new.id,
    CASE
      WHEN accounts_count > 1 THEN 10000
      ELSE 50000
    END
  );

  RETURN new;
END;
$$;

-- Modificar la función upsert_order para considerar organization_id
CREATE OR REPLACE FUNCTION public.upsert_order(
  target_account_id uuid, 
  target_customer_id character varying, 
  target_order_id text, 
  status payment_status, 
  billing_provider billing_provider, 
  total_amount numeric, 
  currency character varying, 
  line_items jsonb
)
RETURNS orders
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
    new_order public.orders;
    new_billing_customer_id int;
    account_organization_id text;
BEGIN
    -- Obtener el organization_id de la cuenta
    SELECT organization_id INTO account_organization_id
    FROM public.accounts
    WHERE id = target_account_id;

    -- Resto de la función sin cambios
    -- ...

    RETURN new_subscription;
END;
$function$;