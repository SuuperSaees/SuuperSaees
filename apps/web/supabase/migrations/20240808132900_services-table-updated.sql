alter table "public"."services" add column "allowed_orders" numeric default '0'::numeric;

alter table "public"."services" add column "connected_briefs" text[];

alter table "public"."services" add column "credit_based" boolean;

alter table "public"."services" add column "credits" numeric default '0'::numeric;

alter table "public"."services" add column "hours" numeric default '0'::numeric;

alter table "public"."services" add column "max_number_of_monthly_orders" numeric;

alter table "public"."services" add column "max_number_of_simultaneous_orders" numeric;

alter table "public"."services" add column "purchase_limit" numeric not null default '0'::numeric;

alter table "public"."services" add column "recurrence" text;

alter table "public"."services" add column "recurring_subscription" boolean;

alter table "public"."services" add column "service_description" text;

alter table "public"."services" add column "service_image" text;

alter table "public"."services" add column "single_sale" boolean;

alter table "public"."services" add column "standard" boolean not null;

alter table "public"."services" add column "test_period" boolean;

alter table "public"."services" add column "test_period_duration" numeric;

alter table "public"."services" add column "test_period_duration_unit_of_measurement" text;

alter table "public"."services" add column "test_period_price" numeric;

alter table "public"."services" add column "time_based" boolean;



