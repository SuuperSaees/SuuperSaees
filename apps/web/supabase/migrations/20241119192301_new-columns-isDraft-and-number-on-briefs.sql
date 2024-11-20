alter table "public"."briefs" add column "isDraft" boolean default false;

alter table "public"."briefs" add column "number" numeric default '1'::numeric;
