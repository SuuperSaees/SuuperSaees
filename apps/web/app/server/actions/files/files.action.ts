'use server';

import { createFilesAction } from "./files";
import { ICreateFile } from "./files.interface";

function getFilesAction() {
    return createFilesAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createFile(props: ICreateFile){
    const filesAction = getFilesAction();
    return await filesAction.createFile(props);
}

export async function getFile(fileId?: string, orderId?: string){
    const filesAction = getFilesAction();
    return await filesAction.getFile(fileId, orderId);
}

