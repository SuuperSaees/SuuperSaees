'use server';

import { createFilesAction } from "./files";
import { ICreateFile } from "./files.interface";

const filesAction = createFilesAction("");

export async function createFile(props: ICreateFile){
    if(!filesAction) return;
    return await filesAction.createFile(props);
}