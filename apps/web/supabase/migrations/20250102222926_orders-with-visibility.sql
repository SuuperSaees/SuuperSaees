alter table "public"."orders_v2" add column "visibility" visibility not null default 'private'::visibility;

INSERT INTO roles 
    (name, hierarchy_level)
VALUES 
    ('client_guest', 8);

INSERT INTO public.role_permissions (role, permission) VALUES
('client_guest', 'messages.write'),
('client_guest', 'messages.read'),
('client_guest', 'orders.write'),
('client_guest', 'orders.read'),
('client_guest', 'orders.manage');