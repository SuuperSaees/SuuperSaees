create type "public"."invoice_status" as enum ('draft', 'issued', 'paid', 'partially_paid', 'overdue', 'cancelled', 'voided');

create type "public"."payment_methods" as enum ('stripe', 'manual', 'bank_transfer', 'cash');

DO $$
BEGIN
    -- Add 'services.write' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'invoices.write' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'invoices.write';
    END IF;

    -- Add 'services.read' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'invoices.read' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'invoices.read';
    END IF;

    -- Add 'services.manage' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'invoices.manage' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'invoices.manage';
    END IF;

    -- Add 'services.delete' if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'invoices.delete' AND enumtypid = 'public.app_permissions'::regtype) THEN
        ALTER TYPE public.app_permissions ADD VALUE 'invoices.delete';
    END IF;
END $$;

COMMIT;

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

alter table "public"."orders" alter column status type "public"."payment_status" using status::text::"public"."payment_status";

alter table "public"."role_permissions" alter column permission type "public"."app_permissions" using permission::text::"public"."app_permissions";

drop type "public"."payment_status__old_version_to_be_dropped" cascade;

alter table "public"."activities" add column "reference_id" text;

CREATE UNIQUE INDEX client_subscriptions_pkey ON public.client_subscriptions USING btree (id);

CREATE INDEX idx_activities_reference_id ON public.activities USING btree (reference_id);

CREATE INDEX idx_client_subscriptions_active ON public.client_subscriptions USING btree (active);

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

alter table "public"."invoices" add constraint "invoices_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_agency_id_fkey";

alter table "public"."invoices" add constraint "invoices_agency_id_number_key" UNIQUE using index "invoices_agency_id_number_key";

alter table "public"."invoices" add constraint "invoices_client_organization_id_fkey" FOREIGN KEY (client_organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."invoices" validate constraint "invoices_client_organization_id_fkey";

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


INSERT INTO public.role_permissions (role, permission) VALUES 
    ('super_admin', 'invoices.write'),
    ('super_admin', 'invoices.read'),
    ('super_admin', 'invoices.manage'),
    ('super_admin', 'invoices.delete'),
    ('agency_owner', 'invoices.write'),
    ('agency_owner', 'invoices.read'),
    ('agency_owner', 'invoices.manage'),
    ('agency_owner', 'invoices.delete'),
    ('agency_project_manager', 'invoices.write'),
    ('agency_project_manager', 'invoices.read'),
    ('agency_project_manager', 'invoices.manage'),
    ('agency_project_manager', 'invoices.delete'),
    ('agency_member', 'invoices.read'),
    ('client_owner', 'invoices.read'),
    ('client_member', 'invoices.read');


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

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    current_date_str TEXT;
    client_hash TEXT;
    next_sequence INTEGER;
    new_invoice_number TEXT;
BEGIN
    -- Generate date in format YYYYMMDD
    current_date_str := to_char(NEW.issue_date, 'YYYYMMDD');
    
    -- Generate a consistent hash from client_organization_id (first 8 characters of MD5)
    client_hash := upper(substring(md5(NEW.client_organization_id::text), 1, 8));
    
    -- Get next sequential number for that client (across all time, not just that day)
    SELECT COALESCE(MAX(
        CASE 
            WHEN number ~ ('^INV-[0-9]{8}-' || client_hash || '-[0-9]+$') 
            THEN CAST(split_part(number, '-', 4) AS INTEGER)
            ELSE 0
        END
    ), 0) + 1
    INTO next_sequence
    FROM invoices 
    WHERE agency_id = NEW.agency_id 
    AND client_organization_id = NEW.client_organization_id
    AND number LIKE 'INV-%-' || client_hash || '-%';
    
    -- Generate new invoice number: INV-YYYYMMDD-CLIENTHASH-SEQUENCE
    new_invoice_number := 'INV-' || current_date_str || '-' || client_hash || '-' || next_sequence;
    
    -- Assign generated number
    NEW.number := new_invoice_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate invoice number before inserting
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- Function to protect invoice number in updates
CREATE OR REPLACE FUNCTION protect_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if we are trying to change the invoice number
    IF OLD.number IS DISTINCT FROM NEW.number THEN
        RAISE EXCEPTION 'You cannot modify the invoice number once it is created';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to protect invoice number in updates
CREATE TRIGGER trigger_protect_invoice_number
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION protect_invoice_number();

alter type "public"."activity_type" rename to "activity_type__old_version_to_be_dropped";

create type "public"."activity_type" as enum ('message', 'review', 'status', 'priority', 'assign', 'due_date', 'description', 'title', 'assigned_to', 'task', 'annotation', 'invoice');

alter table "public"."activities" alter column type type "public"."activity_type" using type::text::"public"."activity_type";

drop type "public"."activity_type__old_version_to_be_dropped";

-- Make order_id column in activities table optional

ALTER TABLE "public"."activities" 
ALTER COLUMN "order_id" DROP NOT NULL;

-- Add comment to document the change
COMMENT ON COLUMN "public"."activities"."order_id" IS 'Optional reference to order. Can be null when activity is not related to an order.';

ALTER TABLE "public"."client_subscriptions" 
ADD CONSTRAINT "client_subscriptions_billing_customer_provider_key" 
UNIQUE ("billing_customer_id", "billing_provider");

CREATE INDEX "idx_client_subscriptions_billing_customer_provider" 
ON "public"."client_subscriptions" 
USING btree ("billing_customer_id", "billing_provider");