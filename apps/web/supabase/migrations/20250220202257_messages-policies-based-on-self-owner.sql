
drop policy "Delete for all authenticated users" on "public"."messages";

drop policy "Update for all authenticated users" on "public"."messages";


create policy "Allow update for own user"
on "public"."messages"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable delete for users based on user_id"
on "public"."messages"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = user_id));


