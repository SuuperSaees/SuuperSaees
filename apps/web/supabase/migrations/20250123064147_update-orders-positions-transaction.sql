set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_order_with_position(p_order_id bigint, p_order_updates jsonb, p_position_updates jsonb[])
 RETURNS orders_v2
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare
  updated_order orders_v2;
begin
  -- Start transaction
  begin
    -- Update main order
    update orders_v2
    set
      status = coalesce((p_order_updates->>'status')::text, status),
      status_id = coalesce((p_order_updates->>'status_id')::bigint, status_id),
      position = coalesce((p_order_updates->>'position')::bigint, position),
      updated_at = (p_order_updates->>'updated_at')::timestamp
    where id = p_order_id
    returning * into updated_order;

    -- Update positions of other orders
    if array_length(p_position_updates, 1) > 0 then
      for i in 1..array_length(p_position_updates, 1) loop
        update orders_v2
        set position = (p_position_updates[i]->>'position')::bigint
        where id = (p_position_updates[i]->>'id')::bigint;
      end loop;
    end if;

    -- Return the updated order as a record of type orders_v2
    return updated_order;
  end;
end;$function$
;

grant execute on function public.update_order_with_position to authenticated, service_role;


