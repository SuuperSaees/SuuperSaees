-- Seed the roles table with default roles 'owner' and 'member'
insert into public.roles(
    name,
    hierarchy_level)
values (
    'super_admin',
    1);

insert into public.roles(
    name,
    hierarchy_level)
values (
    'agency_owner',
    2);

insert into public.roles(
    name,
    hierarchy_level)
values (
    'agency_member',
    3);

insert into public.roles(
    name,
    hierarchy_level)
values (
    'client_owner',
    4);

    insert into public.roles(
    name,
    hierarchy_level)
values (
    'client_member',
    5);

-- We seed the role_permissions table with the default roles and permissions
insert into public.role_permissions(
  role,
  permission)
values (
  'agency_owner',
  'roles.manage'),
(
  'agency_owner',
  'billing.manage'),
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
  'invites.manage');