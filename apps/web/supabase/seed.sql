-- drop trigger if exists "accounts_teardown" on "accounts";
-- create trigger "accounts_teardown" after delete
-- on "public"."accounts" for each row
-- execute function "supabase_functions"."http_request"(
--   'http://host.docker.internal:3000/api/db/webhook',
--   'POST',
--   '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
--   '{}',
--   '5000'
-- );

-- -- this webhook will be triggered after a delete on the subscriptions table
-- -- which should happen when a user deletes their account (and all their subscriptions)
-- drop trigger if exists "subscriptions_delete" on "subscriptions";
-- create trigger "subscriptions_delete" after delete
-- on "public"."subscriptions" for each row
-- execute function "supabase_functions"."http_request"(
--   'http://host.docker.internal:3000/api/db/webhook',
--   'POST',
--   '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
--   '{}',
--   '5000'
-- );

-- -- this webhook will be triggered after every insert on the invitations table
-- -- which should happen when a user invites someone to their account
drop trigger if exists "invitations_insert" on "invitations";
create trigger "invitations_insert" after insert
on "public"."invitations" for each row
execute function "supabase_functions"."http_request"(
  'http://host.docker.internal:3000/api/db/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '5000'
);

-- REALTIME
-- enable realtime for multiple tables
alter publication supabase_realtime
add table public.activities,
    public.agency_statuses,
    public.chat_messages,
    public.files,
    public.messages,
    public.order_files,
    public.orders_v2,
    public.reviews,
    public.subtask_assignations,
    public.subtask_followers,
    public.subtasks,
    public.tasks,
    public.chats,
    public.chat_members,
    public.message_reads,
    public.credits;

-- INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
--         ('00000000-0000-0000-0000-000000000000', 'b73eb03e-fb7a-424d-84ff-18e2791ce0b4', 'authenticated', 'authenticated', 'custom@makerkit.dev', '$2a$10$b3ZPpU6TU3or30QzrXnZDuATPAx2pPq3JW.sNaneVY3aafMSuR4yi', '2024-04-20 08:38:00.860548+00', NULL, '', '2024-04-20 08:37:43.343769+00', '', NULL, '', '', NULL, '2024-04-20 08:38:00.93864+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b73eb03e-fb7a-424d-84ff-18e2791ce0b4", "email": "custom@makerkit.dev", "email_verified": false, "phone_verified": false}', NULL, '2024-04-20 08:37:43.3385+00', '2024-04-20 08:38:00.942809+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
--         ('00000000-0000-0000-0000-000000000000', '31a03e74-1639-45b6-bfa7-77447f1a4762', 'authenticated', 'authenticated', 'test@makerkit.dev', '$2a$10$NaMVRrI7NyfwP.AfAVWt6O/abulGnf9BBqwa6DqdMwXMvOCGpAnVO', '2024-04-20 08:20:38.165331+00', NULL, '', NULL, '', NULL, '', '', NULL, '2024-04-20 09:36:02.521776+00', '{"provider": "email", "providers": ["email"], "role": "super-admin"}', '{"sub": "31a03e74-1639-45b6-bfa7-77447f1a4762", "email": "test@makerkit.dev", "email_verified": false, "phone_verified": false}', NULL, '2024-04-20 08:20:34.459113+00', '2024-04-20 10:07:48.554125+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
--         ('00000000-0000-0000-0000-000000000000', '5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', 'authenticated', 'authenticated', 'owner@makerkit.dev', '$2a$10$D6arGxWJShy8q4RTW18z7eW0vEm2hOxEUovUCj5f3NblyHfamm5/a', '2024-04-20 08:36:37.517993+00', NULL, '', '2024-04-20 08:36:27.639648+00', '', NULL, '', '', NULL, '2024-04-20 08:36:37.614337+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf", "email": "owner@makerkit.dev", "email_verified": false, "phone_verified": false}', NULL, '2024-04-20 08:36:27.630379+00', '2024-04-20 08:36:37.617955+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
--         ('00000000-0000-0000-0000-000000000000', '6b83d656-e4ab-48e3-a062-c0c54a427368', 'authenticated', 'authenticated', 'member@makerkit.dev', '$2a$10$6h/x.AX.6zzphTfDXIJMzuYx13hIYEi/Iods9FXH19J2VxhsLycfa', '2024-04-20 08:41:15.376778+00', NULL, '', '2024-04-20 08:41:08.689674+00', '', NULL, '', '', NULL, '2024-04-20 08:41:15.484606+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6b83d656-e4ab-48e3-a062-c0c54a427368", "email": "member@makerkit.dev", "email_verified": false, "phone_verified": false}', NULL, '2024-04-20 08:41:08.683395+00', '2024-04-20 08:41:15.485494+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);

-- INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
--  ('31a03e74-1639-45b6-bfa7-77447f1a4762', '31a03e74-1639-45b6-bfa7-77447f1a4762', '{"sub": "31a03e74-1639-45b6-bfa7-77447f1a4762", "email": "test@makerkit.dev", "email_verified": false, "phone_verified": false}', 'email', '2024-04-20 08:20:34.46275+00', '2024-04-20 08:20:34.462773+00', '2024-04-20 08:20:34.462773+00', '9bb58bad-24a4-41a8-9742-1b5b4e2d8abd'),        ('5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', '5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', '{"sub": "5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf", "email": "owner@makerkit.dev", "email_verified": false, "phone_verified": false}', 'email', '2024-04-20 08:36:27.637388+00', '2024-04-20 08:36:27.637409+00', '2024-04-20 08:36:27.637409+00', '090598a1-ebba-4879-bbe3-38d517d5066f'),
--         ('b73eb03e-fb7a-424d-84ff-18e2791ce0b4', 'b73eb03e-fb7a-424d-84ff-18e2791ce0b4', '{"sub": "b73eb03e-fb7a-424d-84ff-18e2791ce0b4", "email": "custom@makerkit.dev", "email_verified": false, "phone_verified": false}', 'email', '2024-04-20 08:37:43.342194+00', '2024-04-20 08:37:43.342218+00', '2024-04-20 08:37:43.342218+00', '4392e228-a6d8-4295-a7d6-baed50c33e7c'),
--         ('6b83d656-e4ab-48e3-a062-c0c54a427368', '6b83d656-e4ab-48e3-a062-c0c54a427368', '{"sub": "6b83d656-e4ab-48e3-a062-c0c54a427368", "email": "member@makerkit.dev", "email_verified": false, "phone_verified": false}', 'email', '2024-04-20 08:41:08.687948+00', '2024-04-20 08:41:08.687982+00', '2024-04-20 08:41:08.687982+00', 'd122aca5-4f29-43f0-b1b1-940b000638db');

-- -- Ahora, insertamos los usuarios en la tabla accounts
-- INSERT INTO "public"."accounts" ("id", "primary_owner_id", "is_personal_account", "email", "created_at", "updated_at") VALUES
--         ('b73eb03e-fb7a-424d-84ff-18e2791ce0b4', 'b73eb03e-fb7a-424d-84ff-18e2791ce0b4', true, 'custom@makerkit.dev', '2024-04-20 08:37:43.3385+00', '2024-04-20 08:38:00.942809+00'),
--         ('31a03e74-1639-45b6-bfa7-77447f1a4762', '31a03e74-1639-45b6-bfa7-77447f1a4762', true, 'test@makerkit.dev', '2024-04-20 08:20:34.459113+00', '2024-04-20 10:07:48.554125+00'),
--         ('5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', '5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', true, 'owner@makerkit.dev', '2024-04-20 08:36:27.630379+00', '2024-04-20 08:36:37.617955+00'),
--         ('6b83d656-e4ab-48e3-a062-c0c54a427368', '6b83d656-e4ab-48e3-a062-c0c54a427368', true, 'member@makerkit.dev', '2024-04-20 08:41:08.683395+00', '2024-04-20 08:41:15.485494+00');

-- -- Luego, insertamos las organizaciones
-- INSERT INTO "public"."organizations" ("id", "owner_id", "name", "slug", "picture_url", "public_data") VALUES
--         ('5deaa894-2094-4da3-b4fd-1fada0809d1c', '31a03e74-1639-45b6-bfa7-77447f1a4762', 'Makerkit', 'makerkit', NULL, '{}');

-- -- Finalmente, insertamos las membresías
-- INSERT INTO "public"."accounts_memberships" ("user_id", "organization_id", "account_role", "created_at", "updated_at", "created_by", "updated_by") VALUES
--         ('5c064f1b-78ee-4e1c-ac3b-e99aa97c99bf', '5deaa894-2094-4da3-b4fd-1fada0809d1c', 'agency_owner', '2024-04-20 08:36:44.21028+00', '2024-04-20 08:36:44.21028+00', NULL, NULL),
--         ('b73eb03e-fb7a-424d-84ff-18e2791ce0b4', '5deaa894-2094-4da3-b4fd-1fada0809d1c', 'custom-role', '2024-04-20 08:38:02.50993+00', '2024-04-20 08:38:02.50993+00', NULL, NULL),
--         ('6b83d656-e4ab-48e3-a062-c0c54a427368', '5deaa894-2094-4da3-b4fd-1fada0809d1c', 'agency_member', '2024-04-20 08:41:17.833709+00', '2024-04-20 08:41:17.833709+00', NULL, NULL);

-- SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 5, true);

-- SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);

-- SELECT pg_catalog.setval('"public"."billing_customers_id_seq"', 1, false);

-- SELECT pg_catalog.setval('"public"."invitations_id_seq"', 19, true);

-- SELECT pg_catalog.setval('"public"."role_permissions_id_seq"', 7, true);
-- SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 19, true);

INSERT INTO "public"."plugins" ("id", "deleted_on", "created_at", "updated_at", "type", "description", "metadata", "name", "icon_url") VALUES ('a346f4d2-8501-4f28-810a-26b487a05b65', null, '2025-01-10 22:28:38.765124+00', '2025-01-10 22:28:38.765124+00', 'external', 'Stripe plugin for managing payment gateways.', '{"version": "1.0.0", "documentation_url": "https://stripe.com/docs"}', 'stripe', 'https://pvszgaeqdyypnqftshey.supabase.co/storage/v1/object/public/plugins/stripe.png?t=2025-01-10T22%3A21%3A06.994Z'), ('c9a95821-6d63-4588-98b1-47d4aaaa46be', null, '2025-01-10 22:28:38.765124+00', '2025-01-10 22:28:38.765124+00', 'external', 'Loom plugin for recording and sharing videos.', '{"version": "1.0.0", "documentation_url": "https://loom.com/docs"}', 'loom', 'https://pvszgaeqdyypnqftshey.supabase.co/storage/v1/object/public/plugins/loom.png?t=2025-01-10T22%3A18%3A46.373Z'), ('f7dba2ae-6183-4742-b03c-cda819fb10a9', null, '2025-01-10 22:28:38.765124+00', '2025-01-10 22:28:38.765124+00', 'external', 'Treli plugin for LATAM subscription management.', '{"version": "1.0.0", "documentation_url": "https://treli.com/docs"}', 'treli', 'https://pvszgaeqdyypnqftshey.supabase.co/storage/v1/object/public/plugins/treli.png?t=2025-01-10T22%3A22%3A02.727Z');

-- INSERT INTO "public"."plugins" 
-- ("id", "deleted_on", "created_at", "updated_at", "type", "description", "metadata", "name", "icon_url") 
-- VALUES 
-- ('e8f72b59-3a41-4c8d-9e67-d5b8f1d2c0a3', null, '2025-01-10 22:28:38.765124+00', '2025-01-10 22:28:38.765124+00', 'internal', 'Integrate any custom iframe as an application within the platform.', '{"version": "1.0.0", "documentation_url": "https://suuper.co/docs"}', 'embeds', 'https://pvszgaeqdyypnqftshey.supabase.co/storage/v1/object/public/plugins//embeds.jpg');

INSERT INTO "public"."plugins" (
    "id",
    "deleted_on",
    "created_at", 
    "updated_at",
    "type",
    "description",
    "metadata",
    "name",
    "icon_url"
) VALUES (
    'ad7c2062-bcc0-4cf1-805f-83472d8fa94f',
    null,
    now(),
    now(),
    'internal',
    'Advanced credit management system that allows organizations to track, consume, and purchase credits for various operations and services within the platform.',
    '{"version": "1.0.0", "documentation_url": "https://suuper.co/docs", "users": []}',
    'credits',
    'https://pvszgaeqdyypnqftshey.supabase.co/storage/v1/object/public/plugins//suuper.jpeg'
);

INSERT INTO "public"."plugins" 
("id", "deleted_on", "created_at", "updated_at", "type", "description", "metadata", "name", "icon_url") 
VALUES 
('a71f7291-2bd6-4ee7-9718-ae08414f7bc6', null, '2025-04-23 22:28:38.765124+00', '2025-04-23 22:28:38.765124+00', 'internal', 'Integrate your platform with the powerful Suuuper API to unlock enhanced features and seamless data exchange.', '{"version": "1.0.0", "documentation_url": "https://suuper.co/docs", "users": []}', 'suuperApi', 'https://pvszgaeqdyypnqftshey.supabase.co/storage/v1/object/public/plugins//suuper.jpeg');