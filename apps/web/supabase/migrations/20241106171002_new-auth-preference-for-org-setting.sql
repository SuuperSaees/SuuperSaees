alter type "public"."organization_setting_key" rename to "organization_setting_key__old_version_to_be_dropped";

create type "public"."organization_setting_key" as enum ('theme_color', 'background_color', 'logo_url', 'timezone', 'language', 'date_format', 'sidebar_background_color', 'portal_name', 'favicon_url', 'sender_name', 'sender_email', 'sender_domain', 'logo_dark_url', 'auth_card_background_color', 'auth_section_background_color');

alter table "public"."organization_settings" alter column key type "public"."organization_setting_key" using key::text::"public"."organization_setting_key";

drop type "public"."organization_setting_key__old_version_to_be_dropped";
