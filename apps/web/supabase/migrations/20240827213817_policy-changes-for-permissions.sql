DO $$
BEGIN
    -- Check if 'messages.write' value exists in the enum type 'app_permissions', if not, add it
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'messages.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'messages.write';
    END IF;

    -- Check if 'messages.read' value exists in the enum type 'app_permissions', if not, add it
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'messages.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'messages.read';
    END IF;

    -- Uncomment to add 'messages.delete' if needed
    /*
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'messages.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'messages.delete';
    END IF;
    */
END $$;

-- Commit the transaction to ensure the enum values are properly added
COMMIT;

-- Start a new transaction for the inserts
BEGIN;

-- Insert the role permissions after committing the new enum values
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'messages.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'messages.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_member', 'messages.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_member', 'messages.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'messages.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'messages.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'messages.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'messages.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_owner', 'messages.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_owner', 'messages.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_member', 'messages.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_member', 'messages.read');

-- Commit the transaction to ensure the data is saved
COMMIT;

-- Create policies after the transactions
CREATE POLICY "Enable delete for users based on user_id"
ON "public"."messages"
AS permissive
FOR DELETE
TO public
USING (true);

CREATE POLICY "Read order messages for related members"
ON "public"."messages"
AS permissive
FOR SELECT
TO authenticated
USING (has_permission(auth.uid(), user_id, 'messages.read'::app_permissions));
