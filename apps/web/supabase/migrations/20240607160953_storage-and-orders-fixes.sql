-- drop policy account_image on storage.objects;
drop policy account_image on storage.objects;

create policy account_image on storage.objects for all using (
  bucket_id = 'account_image'
  and kit.get_storage_filename_as_uuid (name) = (
    select
      auth.uid ()
  )
  or public.has_role_on_account (kit.get_storage_filename_as_uuid (name))
)
with
  check (
    bucket_id = 'account_image'
    and (kit.get_storage_filename_as_uuid (name) = (
      select
        auth.uid ()
    )
    or public.has_permission (
      auth.uid (),
      kit.get_storage_filename_as_uuid (name),
      'settings.manage'
    ))
  );

-- allow service_role to insert, update, delete on public.order_items
grant insert, update, delete on table public.order_items to service_role;