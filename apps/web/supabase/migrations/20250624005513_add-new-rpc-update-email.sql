create type "public"."invoice_status" as enum ('draft', 'issued', 'paid', 'partially_paid', 'overdue', 'cancelled', 'voided');

create type "public"."payment_methods" as enum ('stripe', 'manual', 'bank_transfer', 'cash');

drop policy "Create brief" on "public"."briefs";

drop policy "Delete brief" on "public"."briefs";

drop policy "Read briefs" on "public"."briefs";

drop policy "Update brief" on "public"."briefs";

drop function if exists "public"."upsert_order"(target_account_id uuid, target_customer_id character varying, target_order_id text, status payment_status, billing_provider billing_provider, total_amount numeric, currency character varying, line_items jsonb);

alter type "public"."activity_type" rename to "activity_type__old_version_to_be_dropped";

create type "public"."activity_type" as enum ('message', 'review', 'status', 'priority', 'assign', 'due_date', 'description', 'title', 'assigned_to', 'task', 'annotation', 'invoice');

alter type "public"."app_permissions" rename to "app_permissions__old_version_to_be_dropped";

create type "public"."app_permissions" as enum ('roles.manage', 'billing.manage', 'settings.manage', 'members.manage', 'invites.manage', 'tasks.write', 'tasks.delete', 'messages.write', 'messages.read', 'orders.write', 'orders.read', 'orders.manage', 'orders.delete', 'services.write', 'services.read', 'services.manage', 'services.delete', 'billing.write', 'billing.read', 'billing.delete', 'timers.write', 'timers.read', 'timers.manage', 'timers.delete', 'embeds.write', 'embeds.read', 'embeds.manage', 'embeds.delete', 'invoices.write', 'invoices.read', 'invoices.manage', 'invoices.delete');

alter type "public"."organization_setting_key" rename to "organization_setting_key__old_version_to_be_dropped";

create type "public"."organization_setting_key" as enum ('theme_color', 'background_color', 'logo_url', 'timezone', 'language', 'date_format', 'sidebar_background_color', 'portal_name', 'favicon_url', 'sender_name', 'sender_email', 'sender_domain', 'logo_dark_url', 'auth_card_background_color', 'auth_section_background_color', 'dashboard_url', 'pinned_organizations', 'catalog_provider_url', 'catalog_product_url', 'tool_copy_list_url', 'auth_background_url', 'parteners_url', 'catalog_product_wholesale_url', 'catalog_product_private_label_url', 'training_url', 'catalog_sourcing_china_url', 'calendar_url', 'notification_sound', 'payment_details');

alter type "public"."payment_status" rename to "payment_status__old_version_to_be_dropped";

create type "public"."payment_status" as enum ('pending', 'succeeded', 'failed', 'refunded');

create table "public"."client_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "client_id" uuid not null,
    "billing_subscription_id" text,
    "billing_customer_id" text,
    "billing_provider" billing_provider,
    "period_starts_at" timestamp with time zone,
    "period_ends_at" timestamp with time zone,
    "trial_starts_at" timestamp with time zone,
    "trial_ends_at" timestamp with time zone,
    "days_used" bigint,
    "currency" text,
    "status" text,
    "active" boolean,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_on" timestamp with time zone
);


alter table "public"."client_subscriptions" enable row level security;

create table "public"."invoice_items" (
    "id" uuid not null default gen_random_uuid(),
    "invoice_id" uuid not null,
    "service_id" bigint,
    "description" text not null,
    "quantity" numeric(10,2) not null default 1,
    "unit_price" numeric(12,2) not null,
    "total_price" numeric(12,2) not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."invoice_items" enable row level security;

create table "public"."invoice_payments" (
    "id" uuid not null default gen_random_uuid(),
    "invoice_id" uuid not null,
    "payment_method" payment_methods not null,
    "amount" numeric(12,2) not null,
    "status" payment_status not null default 'pending'::payment_status,
    "provider_payment_id" text,
    "provider_charge_id" text,
    "reference_number" text,
    "notes" text,
    "processed_by" uuid,
    "processed_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."invoice_payments" enable row level security;

create table "public"."invoices" (
    "id" uuid not null default gen_random_uuid(),
    "agency_id" uuid not null,
    "client_organization_id" uuid not null,
    "number" text not null,
    "issue_date" date not null default CURRENT_DATE,
    "due_date" date not null,
    "status" invoice_status not null default 'draft'::invoice_status,
    "subtotal_amount" numeric(12,2) not null,
    "tax_amount" numeric(12,2) default 0,
    "total_amount" numeric(12,2) not null,
    "currency" text not null default 'USD'::text,
    "notes" text,
    "provider_id" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_on" timestamp with time zone,
    "checkout_url" text
);


alter table "public"."invoices" enable row level security;

alter table "public"."activities" alter column type type "public"."activity_type" using type::text::"public"."activity_type";

alter table "public"."orders" alter column status type "public"."payment_status" using status::text::"public"."payment_status";

alter table "public"."organization_settings" alter column key type "public"."organization_setting_key" using key::text::"public"."organization_setting_key";

alter table "public"."role_permissions" alter column permission type "public"."app_permissions" using permission::text::"public"."app_permissions";

drop type "public"."activity_type__old_version_to_be_dropped";

drop type "public"."app_permissions__old_version_to_be_dropped";

drop type "public"."organization_setting_key__old_version_to_be_dropped";

drop type "public"."payment_status__old_version_to_be_dropped";

alter table "public"."activities" add column "reference_id" text;

alter table "public"."activities" alter column "order_id" drop not null;

alter table "public"."sessions" add column "metadata" jsonb;

CREATE UNIQUE INDEX client_subscriptions_billing_customer_provider_key ON public.client_subscriptions USING btree (billing_customer_id, billing_provider);

CREATE UNIQUE INDEX client_subscriptions_pkey ON public.client_subscriptions USING btree (id);

CREATE INDEX idx_activities_reference_id ON public.activities USING btree (reference_id);

CREATE INDEX idx_client_subscriptions_active ON public.client_subscriptions USING btree (active);

CREATE INDEX idx_client_subscriptions_billing_customer_provider ON public.client_subscriptions USING btree (billing_customer_id, billing_provider);

CREATE INDEX idx_client_subscriptions_billing_subscription_id ON public.client_subscriptions USING btree (billing_subscription_id);

CREATE INDEX idx_client_subscriptions_client_id ON public.client_subscriptions USING btree (client_id);

CREATE INDEX idx_client_subscriptions_deleted_on ON public.client_subscriptions USING btree (deleted_on) WHERE (deleted_on IS NULL);

CREATE INDEX idx_client_subscriptions_period ON public.client_subscriptions USING btree (period_starts_at, period_ends_at);

CREATE INDEX idx_client_subscriptions_status ON public.client_subscriptions USING btree (status);

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items USING btree (invoice_id);

CREATE INDEX idx_invoice_items_service_id ON public.invoice_items USING btree (service_id);

CREATE INDEX idx_invoice_payments_invoice_id ON public.invoice_payments USING btree (invoice_id);

CREATE INDEX idx_invoice_payments_method ON public.invoice_payments USING btree (payment_method);

CREATE INDEX idx_invoice_payments_processed_at ON public.invoice_payments USING btree (processed_at);

CREATE INDEX idx_invoice_payments_provider_payment_id ON public.invoice_payments USING btree (provider_payment_id);

CREATE INDEX idx_invoice_payments_status ON public.invoice_payments USING btree (status);

CREATE INDEX idx_invoices_agency_id ON public.invoices USING btree (agency_id);

CREATE INDEX idx_invoices_client_organization_id ON public.invoices USING btree (client_organization_id);

CREATE INDEX idx_invoices_covering ON public.invoices USING btree (agency_id, status, issue_date DESC) INCLUDE (id, number, client_organization_id, total_amount, due_date) WHERE (deleted_on IS NULL);

CREATE INDEX idx_invoices_deleted_on ON public.invoices USING btree (deleted_on) WHERE (deleted_on IS NULL);

CREATE INDEX idx_invoices_due_date ON public.invoices USING btree (due_date);

CREATE INDEX idx_invoices_issue_date ON public.invoices USING btree (issue_date);

CREATE INDEX idx_invoices_status ON public.invoices USING btree (status);

CREATE UNIQUE INDEX invoice_items_pkey ON public.invoice_items USING btree (id);

CREATE UNIQUE INDEX invoice_payments_pkey ON public.invoice_payments USING btree (id);

CREATE UNIQUE INDEX invoice_payments_provider_payment_id_key ON public.invoice_payments USING btree (provider_payment_id);

CREATE UNIQUE INDEX invoices_agency_id_number_key ON public.invoices USING btree (agency_id, number);

CREATE UNIQUE INDEX invoices_pkey ON public.invoices USING btree (id);

alter table "public"."client_subscriptions" add constraint "client_subscriptions_pkey" PRIMARY KEY using index "client_subscriptions_pkey";

alter table "public"."invoice_items" add constraint "invoice_items_pkey" PRIMARY KEY using index "invoice_items_pkey";

alter table "public"."invoice_payments" add constraint "invoice_payments_pkey" PRIMARY KEY using index "invoice_payments_pkey";

alter table "public"."invoices" add constraint "invoices_pkey" PRIMARY KEY using index "invoices_pkey";

alter table "public"."client_subscriptions" add constraint "client_subscriptions_billing_customer_provider_key" UNIQUE using index "client_subscriptions_billing_customer_provider_key";

alter table "public"."client_subscriptions" add constraint "client_subscriptions_client_id_fkey" FOREIGN KEY (client_id) REFERENCES clients(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."client_subscriptions" validate constraint "client_subscriptions_client_id_fkey";

alter table "public"."invoice_items" add constraint "invoice_items_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoice_items" validate constraint "invoice_items_invoice_id_fkey";

alter table "public"."invoice_items" add constraint "invoice_items_service_id_fkey" FOREIGN KEY (service_id) REFERENCES services(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."invoice_items" validate constraint "invoice_items_service_id_fkey";

alter table "public"."invoice_payments" add constraint "invoice_payments_invoice_id_fkey" FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoice_payments" validate constraint "invoice_payments_invoice_id_fkey";

alter table "public"."invoice_payments" add constraint "invoice_payments_processed_by_fkey" FOREIGN KEY (processed_by) REFERENCES accounts(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."invoice_payments" validate constraint "invoice_payments_processed_by_fkey";

alter table "public"."invoice_payments" add constraint "invoice_payments_provider_payment_id_key" UNIQUE using index "invoice_payments_provider_payment_id_key";

alter table "public"."invoices" add constraint "invoices_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES organizations(id) not valid;

alter table "public"."invoices" validate constraint "invoices_agency_id_fkey";

alter table "public"."invoices" add constraint "invoices_agency_id_number_key" UNIQUE using index "invoices_agency_id_number_key";

alter table "public"."invoices" add constraint "invoices_client_organization_id_fkey" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) not valid;

alter table "public"."invoices" validate constraint "invoices_client_organization_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    current_date_str TEXT;
    next_sequence INTEGER;
    new_invoice_number TEXT;
BEGIN
    -- Generate date in format YYYYMMDD
    current_date_str := to_char(NEW.issue_date, 'YYYYMMDD');
    
    -- Get next sequential number for that day and agency
    SELECT COALESCE(MAX(
        CASE 
            WHEN number ~ ('^INV-' || current_date_str || '-[0-9]+$') 
            THEN CAST(split_part(number, '-', 3) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO next_sequence
    FROM invoices 
    WHERE agency_id = NEW.agency_id 
    AND number LIKE 'INV-' || current_date_str || '-%'
    AND deleted_on IS NULL;
    
    -- Generate new invoice number
    new_invoice_number := 'INV-' || current_date_str || '-' || next_sequence;
    
    -- Assign generated number
    NEW.number := new_invoice_number;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.protect_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Check if we are trying to change the invoice number
    IF OLD.number IS DISTINCT FROM NEW.number THEN
        RAISE EXCEPTION 'You cannot modify the invoice number once it is created';
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_email(user_id uuid, new_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    old_email text;
    v_domain text;
BEGIN
    -- Verify that user_id is provided
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    -- Verify that new_email is provided and not empty
    IF new_email IS NULL OR new_email = '' THEN
        RAISE EXCEPTION 'New email cannot be null or empty';
    END IF;
    
    -- Get the current email from auth.users
    SELECT email INTO old_email
    FROM auth.users
    WHERE id = user_id;
    
    -- Verify that the user exists
    IF old_email IS NULL THEN
        RAISE EXCEPTION 'User not found with ID: %', user_id;
    END IF;
    
    -- Verify that the new email is different from the current one
    IF old_email = new_email THEN
        RAISE EXCEPTION 'New email is the same as current email';
    END IF;
    
    -- Update email in auth.users
    UPDATE auth.users
    SET 
        email = new_email,
        updated_at = now()
    WHERE id = user_id;
    
    -- Verify that the update was successful
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to update email in auth.users for user ID: %', user_id;
    END IF;
    
    -- Update email in public.accounts
    UPDATE public.accounts
    SET 
        email = new_email,
        updated_at = now()
    WHERE id = user_id;
    
    -- Verify that the update was successful in accounts
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to update email in accounts for user ID: %', user_id;
    END IF;
    
    -- Update email in auth.user_credentials for all domains
    UPDATE auth.user_credentials
    SET 
        email = new_email,
        updated_at = now()
    WHERE email = old_email;
    
    -- Log the operation (optional)
    RAISE NOTICE 'Email successfully updated from % to % for user ID: %', old_email, new_email, user_id;
    
END;
$function$
;

grant delete on table "public"."client_subscriptions" to "anon";

grant insert on table "public"."client_subscriptions" to "anon";

grant references on table "public"."client_subscriptions" to "anon";

grant select on table "public"."client_subscriptions" to "anon";

grant trigger on table "public"."client_subscriptions" to "anon";

grant truncate on table "public"."client_subscriptions" to "anon";

grant update on table "public"."client_subscriptions" to "anon";

grant delete on table "public"."client_subscriptions" to "authenticated";

grant insert on table "public"."client_subscriptions" to "authenticated";

grant references on table "public"."client_subscriptions" to "authenticated";

grant select on table "public"."client_subscriptions" to "authenticated";

grant trigger on table "public"."client_subscriptions" to "authenticated";

grant truncate on table "public"."client_subscriptions" to "authenticated";

grant update on table "public"."client_subscriptions" to "authenticated";

grant delete on table "public"."client_subscriptions" to "service_role";

grant insert on table "public"."client_subscriptions" to "service_role";

grant references on table "public"."client_subscriptions" to "service_role";

grant select on table "public"."client_subscriptions" to "service_role";

grant trigger on table "public"."client_subscriptions" to "service_role";

grant truncate on table "public"."client_subscriptions" to "service_role";

grant update on table "public"."client_subscriptions" to "service_role";

grant delete on table "public"."invoice_items" to "anon";

grant insert on table "public"."invoice_items" to "anon";

grant references on table "public"."invoice_items" to "anon";

grant select on table "public"."invoice_items" to "anon";

grant trigger on table "public"."invoice_items" to "anon";

grant truncate on table "public"."invoice_items" to "anon";

grant update on table "public"."invoice_items" to "anon";

grant delete on table "public"."invoice_items" to "authenticated";

grant insert on table "public"."invoice_items" to "authenticated";

grant references on table "public"."invoice_items" to "authenticated";

grant select on table "public"."invoice_items" to "authenticated";

grant trigger on table "public"."invoice_items" to "authenticated";

grant truncate on table "public"."invoice_items" to "authenticated";

grant update on table "public"."invoice_items" to "authenticated";

grant delete on table "public"."invoice_items" to "service_role";

grant insert on table "public"."invoice_items" to "service_role";

grant references on table "public"."invoice_items" to "service_role";

grant select on table "public"."invoice_items" to "service_role";

grant trigger on table "public"."invoice_items" to "service_role";

grant truncate on table "public"."invoice_items" to "service_role";

grant update on table "public"."invoice_items" to "service_role";

grant delete on table "public"."invoice_payments" to "anon";

grant insert on table "public"."invoice_payments" to "anon";

grant references on table "public"."invoice_payments" to "anon";

grant select on table "public"."invoice_payments" to "anon";

grant trigger on table "public"."invoice_payments" to "anon";

grant truncate on table "public"."invoice_payments" to "anon";

grant update on table "public"."invoice_payments" to "anon";

grant delete on table "public"."invoice_payments" to "authenticated";

grant insert on table "public"."invoice_payments" to "authenticated";

grant references on table "public"."invoice_payments" to "authenticated";

grant select on table "public"."invoice_payments" to "authenticated";

grant trigger on table "public"."invoice_payments" to "authenticated";

grant truncate on table "public"."invoice_payments" to "authenticated";

grant update on table "public"."invoice_payments" to "authenticated";

grant delete on table "public"."invoice_payments" to "service_role";

grant insert on table "public"."invoice_payments" to "service_role";

grant references on table "public"."invoice_payments" to "service_role";

grant select on table "public"."invoice_payments" to "service_role";

grant trigger on table "public"."invoice_payments" to "service_role";

grant truncate on table "public"."invoice_payments" to "service_role";

grant update on table "public"."invoice_payments" to "service_role";

grant delete on table "public"."invoices" to "anon";

grant insert on table "public"."invoices" to "anon";

grant references on table "public"."invoices" to "anon";

grant select on table "public"."invoices" to "anon";

grant trigger on table "public"."invoices" to "anon";

grant truncate on table "public"."invoices" to "anon";

grant update on table "public"."invoices" to "anon";

grant delete on table "public"."invoices" to "authenticated";

grant insert on table "public"."invoices" to "authenticated";

grant references on table "public"."invoices" to "authenticated";

grant select on table "public"."invoices" to "authenticated";

grant trigger on table "public"."invoices" to "authenticated";

grant truncate on table "public"."invoices" to "authenticated";

grant update on table "public"."invoices" to "authenticated";

grant delete on table "public"."invoices" to "service_role";

grant insert on table "public"."invoices" to "service_role";

grant references on table "public"."invoices" to "service_role";

grant select on table "public"."invoices" to "service_role";

grant trigger on table "public"."invoices" to "service_role";

grant truncate on table "public"."invoices" to "service_role";

grant update on table "public"."invoices" to "service_role";

create policy "client_subscriptions_all"
on "public"."client_subscriptions"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "invoice_items_all"
on "public"."invoice_items"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "invoice_payments_all"
on "public"."invoice_payments"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "invoices_delete"
on "public"."invoices"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_agency_organization(auth.uid(), invoices.agency_id) AND has_permission(auth.uid(), invoices.agency_id, 'invoices.delete'::app_permissions) AND (invoices.agency_id = (sess.session).organization_id)))));


create policy "invoices_read"
on "public"."invoices"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_agency_organization(auth.uid(), invoices.agency_id) AND has_permission(auth.uid(), invoices.agency_id, 'invoices.read'::app_permissions) AND (invoices.agency_id = (sess.session).organization_id)))) OR (EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_client_organization(auth.uid(), invoices.client_organization_id) AND has_permission(auth.uid(), invoices.client_organization_id, 'invoices.read'::app_permissions) AND (invoices.agency_id = (sess.session).agency_id))))));


create policy "invoices_update"
on "public"."invoices"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_agency_organization(auth.uid(), invoices.agency_id) AND has_permission(auth.uid(), invoices.agency_id, 'invoices.manage'::app_permissions) AND (invoices.agency_id = (sess.session).organization_id)))));


create policy "invoices_write"
on "public"."invoices"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM ( SELECT get_current_session() AS session) sess
  WHERE (is_user_in_agency_organization(auth.uid(), invoices.agency_id) AND has_permission(auth.uid(), invoices.agency_id, 'invoices.write'::app_permissions) AND (invoices.agency_id = (sess.session).organization_id)))));


create policy "Create brief"
on "public"."briefs"
as permissive
for insert
to authenticated
with check (true);


create policy "Delete brief"
on "public"."briefs"
as permissive
for delete
to authenticated
using (true);


create policy "Read briefs"
on "public"."briefs"
as permissive
for select
to authenticated
using (true);


create policy "Update brief"
on "public"."briefs"
as permissive
for update
to authenticated
using (true);


CREATE TRIGGER checkouts_insert AFTER INSERT ON public.checkouts FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('http://host.docker.internal:3000/api/db/webhook', 'POST', '{"Content-type":"application/json","X-Supabase-Event-Signature":"WEBHOOKSECRET"}', '{}', '5000');

CREATE TRIGGER invitations_insert AFTER INSERT ON public.invitations FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('http://host.docker.internal:3000/api/db/webhook', 'POST', '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}', '{}', '5000');

CREATE TRIGGER trigger_generate_invoice_number BEFORE INSERT ON public.invoices FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

CREATE TRIGGER trigger_protect_invoice_number BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION protect_invoice_number();


