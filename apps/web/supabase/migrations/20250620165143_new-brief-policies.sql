-- Configure role permissions for briefs (enum values added in previous migration)
INSERT INTO public.role_permissions (role, permission) VALUES 
  ('super_admin', 'briefs.read'),
  ('super_admin', 'briefs.write'),
  ('super_admin', 'briefs.delete'),
  ('super_admin', 'briefs.manage'),
  ('agency_owner', 'briefs.read'),
  ('agency_owner', 'briefs.write'),
  ('agency_owner', 'briefs.delete'),
  ('agency_owner', 'briefs.manage'),
  ('agency_project_manager', 'briefs.read'),
  ('agency_project_manager', 'briefs.write'),
  ('agency_project_manager', 'briefs.delete'),
  ('agency_member', 'briefs.read'),
  ('client_owner', 'briefs.read'),
  ('client_member', 'briefs.read'),
  ('client_guest', 'briefs.read')
ON CONFLICT (role, permission) DO NOTHING;

-- Drop existing policies for briefs table
drop policy if exists "Create brief" on "public"."briefs";
drop policy if exists "Update brief" on "public"."briefs";
drop policy if exists "Delete brief" on "public"."briefs";
drop policy if exists "Read briefs" on "public"."briefs";

-- Create optimized policy for creating briefs
-- Uses permission system instead of manual role checking
create policy "Create brief"
on "public"."briefs"
as permissive
for insert
to authenticated
with check ((EXISTS (
  SELECT 1
  FROM (SELECT get_current_session() AS session) sess
  WHERE has_permission(auth.uid(), (sess.session).organization_id, 'briefs.write'::app_permissions)
    AND is_user_in_agency_organization(auth.uid(), (sess.session).organization_id)
)));

-- Create optimized policy for updating briefs  
-- Uses permission system and validates organization ownership
create policy "Update brief"
on "public"."briefs"
as permissive
for update
to authenticated
using ((EXISTS (
  SELECT 1
  FROM (SELECT get_current_session() AS session) sess
  LEFT JOIN public.organizations o ON o.owner_id = briefs.propietary_organization_id
  WHERE has_permission(auth.uid(), o.id, 'briefs.write'::app_permissions)
    AND is_user_in_agency_organization(auth.uid(), o.id)
    AND o.id = (sess.session).organization_id
)));

-- Create optimized policy for deleting briefs
-- Uses permission system and validates organization ownership
create policy "Delete brief"
on "public"."briefs"
as permissive
for delete
to authenticated
using ((EXISTS (
  SELECT 1
  FROM (SELECT get_current_session() AS session) sess
  LEFT JOIN public.organizations o ON o.owner_id = briefs.propietary_organization_id
  WHERE has_permission(auth.uid(), o.id, 'briefs.delete'::app_permissions)
    AND is_user_in_agency_organization(auth.uid(), o.id)
    AND o.id = (sess.session).organization_id
)));

-- Create optimized policy for reading briefs
-- Agency users: Can read briefs from their organization
-- Client users: Can read briefs from services they have access to
create policy "Read briefs"
on "public"."briefs"
as permissive
for select
to authenticated
using ((EXISTS (
  SELECT 1
  FROM (SELECT get_current_session() AS session) sess
  WHERE has_permission(auth.uid(), (sess.session).organization_id, 'briefs.read'::app_permissions)
    AND (
      -- Agency users: read briefs from their organization
      (
        is_user_in_agency_organization(auth.uid(), (sess.session).organization_id)
        AND EXISTS (
          SELECT 1 
          FROM public.organizations o 
          WHERE o.owner_id = briefs.propietary_organization_id 
            AND o.id = (sess.session).organization_id
        )
      )
      OR
      -- Client users: read briefs from services they have access to
      (
        is_user_in_client_organization(auth.uid(), (sess.session).organization_id)
        AND EXISTS (
          SELECT 1
          FROM public.client_services cs
          JOIN public.service_briefs sb ON cs.service_id = sb.service_id
          WHERE sb.brief_id = briefs.id
            AND cs.client_organization_id = (sess.session).organization_id
            AND cs.agency_id = (sess.session).agency_id
        )
      )
    )
)));
