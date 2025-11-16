alter table "public"."orders_v2" alter column "customer_id" set not null;

alter table "public"."orders_v2" alter column "customer_id" set data type uuid using "customer_id"::uuid;

alter table "public"."orders_v2" alter column "description" set not null;

alter table "public"."orders_v2" alter column "title" set not null;

CREATE UNIQUE INDEX clients_id_key ON public.clients USING btree (id);

alter table "public"."clients" add constraint "clients_id_key" UNIQUE using index "clients_id_key";

alter table "public"."orders_v2" add constraint "orders_v2_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES clients(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."orders_v2" validate constraint "orders_v2_customer_id_fkey";




