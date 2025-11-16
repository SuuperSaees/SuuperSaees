-- Drop redundant indexes if they exist
DROP INDEX IF EXISTS idx_orders_v2_agency_active;
DROP INDEX IF EXISTS idx_orders_v2_agency_performance_new;
DROP INDEX IF EXISTS orders_v2_agency_id_idx;
DROP INDEX IF EXISTS orders_v2_status_id_idx;
DROP INDEX IF EXISTS idx_organization_settings_org;

-- Keep essential indexes for primary key lookups
CREATE INDEX idx_accounts_id ON public.accounts USING btree (id);

CREATE INDEX idx_agency_statuses_id ON public.agency_statuses USING btree (id);

CREATE INDEX idx_order_assignations_lookup ON public.order_assignations USING btree (order_id, agency_member_id);

CREATE INDEX idx_order_assignations_order_id ON public.order_assignations USING btree (order_id);

CREATE INDEX idx_orders_v2_covering ON public.orders_v2 USING btree (agency_id, created_at DESC) INCLUDE (id, title, priority, due_date, updated_at, status_id, client_organization_id, customer_id) WHERE (deleted_on IS NULL);

CREATE INDEX idx_organization_settings_org_id ON public.organization_settings USING btree (organization_id);

CREATE INDEX idx_organizations_id ON public.organizations USING btree (id);

CREATE INDEX idx_user_settings_user_id ON public.user_settings USING btree (user_id);

CREATE INDEX orders_v2_brief_id_idx ON public.orders_v2 USING btree (brief_id);

CREATE INDEX orders_v2_client_organization_id_idx ON public.orders_v2 USING btree (client_organization_id);

CREATE INDEX orders_v2_customer_id_idx ON public.orders_v2 USING btree (customer_id);











