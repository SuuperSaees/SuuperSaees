import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";
import { Folder } from "~/lib/folder.types";

export class FoldersRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>

    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

    async CheckIfItIsAnOrderFolder(folderUuid: string) {
        const { data: folders, error: foldersError } = await this.client
        .from('orders_v2')
        .select('title, uuid')
        .eq('uuid', folderUuid);
    
        if (foldersError) throw foldersError;
        
        if (folders.length > 0) return true;
        
        if (folderUuid === '') return true;
        
        return false;
    }

    async createFolderFiles(folderFilesToInsert: Folder.Insert[]) {
        const { error: folderFilesError } = await this.client
            .from('folder_files')
            .insert(folderFilesToInsert);

        if (folderFilesError) throw folderFilesError;
    }
}