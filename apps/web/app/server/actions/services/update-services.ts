"use server";

import { getSupabaseServerComponentClient } from "@kit/supabase/server-component-client";
import { Service } from "~/lib/services.types";

export const updateService = async (
  serviceId: Service.Type['id'],
  data: Service.Update,
) => {
  const client = getSupabaseServerComponentClient();

  const { data: service, error } = await client
    .from("services")
    .update(data)
    .eq("id", serviceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating service ${serviceId}: ${error.message}`);
  }

  return service;
};
