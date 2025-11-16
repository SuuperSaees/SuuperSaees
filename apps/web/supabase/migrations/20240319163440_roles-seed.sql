-- Seed the roles table with default roles
insert into public.roles(
    name,
    hierarchy_level)
values (
    'super_admin',
    1),
(
    'agency_owner',
    2),
(
    'agency_project_manager',
    3),
(
    'agency_member',
    4),
(
    'client_owner',
    5),
(
    'client_member',
    6);

-- Seed the role_permissions table with the default roles and permissions
insert into public.role_permissions(
  role,
  permission)
values (
  'super_admin',
  'roles.manage'),
(
  'super_admin', 
  'billing.manage'),
(
  'super_admin',
  'settings.manage'),
(
  'super_admin',
  'members.manage'),
(
  'super_admin',
  'invites.manage'),
(
  'agency_owner',
  'billing.manage'),
(
  'agency_owner',
  'roles.manage'),
(
  'agency_owner',
  'settings.manage'),
(
  'agency_owner',
  'members.manage'),
(
  'agency_owner',
  'invites.manage'),
(
  'agency_member',
  'settings.manage'),
(
  'agency_member',
  'invites.manage'),
(
  'agency_project_manager',
  'roles.manage'),
(
  'agency_project_manager',
  'settings.manage'),
(
  'agency_project_manager',
  'members.manage'),
(
  'agency_project_manager',
  'invites.manage');

