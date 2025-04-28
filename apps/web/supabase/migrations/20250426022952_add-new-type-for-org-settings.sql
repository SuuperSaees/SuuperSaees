alter type "public"."organization_setting_key" rename to "organization_setting_key__old_version_to_be_dropped";

create type "public"."organization_setting_key" as enum ('theme_color', 'background_color', 'logo_url', 'timezone', 'language', 'date_format', 'sidebar_background_color', 'portal_name', 'favicon_url', 'sender_name', 'sender_email', 'sender_domain', 'logo_dark_url', 'auth_card_background_color', 'auth_section_background_color', 'dashboard_url', 'pinned_organizations', 'catalog_provider_url', 'catalog_product_url', 'tool_copy_list_url', 'auth_background_url', 'parteners_url', 'catalog_product_wholesale_url', 'catalog_product_private_label_url', 'training_url', 'catalog_sourcing_china_url', 'calendar_url');

alter table "public"."organization_settings" alter column key type "public"."organization_setting_key" using key::text::"public"."organization_setting_key";

drop type "public"."organization_setting_key__old_version_to_be_dropped" cascade;