alter type "public"."organization_setting_key" rename to "organization_setting_key__old_version_to_be_dropped";

create type "public"."organization_setting_key" as enum ('theme_color', 'background_color', 'logo_url', 'timezone', 'language', 'date_format', 'sidebar_background_color', 'portal_name', 'favicon_url', 'sender_name', 'sender_email', 'sender_domain', 'logo_dark_url', 'auth_card_background_color', 'auth_section_background_color', 'dashboard_url', 'pinned_organizations', 'catalog_provider_url', 'catalog_product_url', 'tool_copy_list_url', 'auth_background_url', 'parteners_url', 'catalog_product_wholesale_url', 'catalog_product_private_label_url', 'training_url', 'catalog_sourcing_china_url', 'calendar_url', 'notification_sound', 'payment_details', 'billing_details');

create table "public"."invoice_settings" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_on" timestamp with time zone,
    "invoice_id" uuid not null,
    "organization_id" uuid not null,
    "name" text not null,
    "address_1" text not null,
    "address_2" text,
    "country" text not null,
    "postal_code" text not null,
    "city" text not null,
    "state" text,
    "tax_id_type" text,
    "tax_id_number" text
);


alter table "public"."invoice_settings" enable row level security;

create policy "invoice_settings_all"
on "public"."invoice_settings"
as permissive
for all
to authenticated
using (true)
with check (true);

alter table "public"."organization_settings" alter column key type "public"."organization_setting_key" using key::text::"public"."organization_setting_key";

drop type "public"."organization_setting_key__old_version_to_be_dropped";

CREATE INDEX idx_invoice_settings_deleted_on ON public.invoice_settings USING btree (deleted_on) WHERE (deleted_on IS NULL);

CREATE INDEX idx_invoice_settings_invoice_id ON public.invoice_settings USING btree (invoice_id);

CREATE UNIQUE INDEX idx_invoice_settings_invoice_org_active ON public.invoice_settings USING btree (invoice_id, organization_id) WHERE (deleted_on IS NULL);

CREATE INDEX idx_invoice_settings_organization_id ON public.invoice_settings USING btree (organization_id);

CREATE UNIQUE INDEX invoice_settings_pkey ON public.invoice_settings USING btree (id);

alter table "public"."invoice_settings" add constraint "invoice_settings_pkey" PRIMARY KEY using index "invoice_settings_pkey";

alter table "public"."invoice_settings" add constraint "invoice_settings_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoice_settings" validate constraint "invoice_settings_invoice_id_fkey";

alter table "public"."invoice_settings" add constraint "invoice_settings_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoice_settings" validate constraint "invoice_settings_organization_id_fkey";

grant delete on table "public"."invoice_settings" to "anon";

grant insert on table "public"."invoice_settings" to "anon";

grant references on table "public"."invoice_settings" to "anon";

grant select on table "public"."invoice_settings" to "anon";

grant trigger on table "public"."invoice_settings" to "anon";

grant truncate on table "public"."invoice_settings" to "anon";

grant update on table "public"."invoice_settings" to "anon";

grant delete on table "public"."invoice_settings" to "authenticated";

grant insert on table "public"."invoice_settings" to "authenticated";

grant references on table "public"."invoice_settings" to "authenticated";

grant select on table "public"."invoice_settings" to "authenticated";

grant trigger on table "public"."invoice_settings" to "authenticated";

grant truncate on table "public"."invoice_settings" to "authenticated";

grant update on table "public"."invoice_settings" to "authenticated";

grant delete on table "public"."invoice_settings" to "service_role";

grant insert on table "public"."invoice_settings" to "service_role";

grant references on table "public"."invoice_settings" to "service_role";

grant select on table "public"."invoice_settings" to "service_role";

grant trigger on table "public"."invoice_settings" to "service_role";

grant truncate on table "public"."invoice_settings" to "service_role";

grant update on table "public"."invoice_settings" to "service_role";
