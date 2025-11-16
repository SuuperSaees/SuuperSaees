"use server";

import { getSupabaseServerComponentClient } from "@kit/supabase/server-component-client";

export async function deleteFolder(folder_id: string) {
  const client = getSupabaseServerComponentClient();

  const { data: folderData, error: folderError } = await client
    .from("folders")
    .delete()
    .eq("id", folder_id)
    .select();
  if (folderError)
    throw new Error(`Error creating folder: ${folderError.message}`);

  return folderData;
}
