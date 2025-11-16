-- Start a new transaction for the inserts
BEGIN;

-- Insert the role permissions after committing the new enum values
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'orders.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'orders.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'orders.manage');
INSERT INTO public.role_permissions (role, permission) VALUES ('super_admin', 'orders.delete');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'orders.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_member', 'orders.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'orders.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_owner', 'orders.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_member', 'orders.write');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'orders.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_member', 'orders.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'orders.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_owner', 'orders.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_member', 'orders.read');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'orders.manage');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_member', 'orders.manage');    
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'orders.manage');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_owner', 'orders.manage');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_member', 'orders.manage');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_owner', 'orders.delete');
INSERT INTO public.role_permissions (role, permission) VALUES ('agency_project_manager', 'orders.delete');
INSERT INTO public.role_permissions (role, permission) VALUES ('client_owner', 'orders.delete');

-- Commit the transaction to ensure the data is saved
COMMIT;