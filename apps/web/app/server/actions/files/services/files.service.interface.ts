import { ICreateFile } from "../files.interface";
import { File } from "~/lib/file.types";

export interface IFilesService {
    /*
    * CRUD Operations
    */
    createFile(createFileProps: ICreateFile, userId: string): Promise<File.Type[]>;
    createUploadBucketURL(file: File): Promise<string>;
    getFile(fileId: string): Promise<File.Type>;
    updateFile(fileId: string, file: File): Promise<File>;
    deleteFile(fileId: string): Promise<void>;
    getFiles(): Promise<File[]>;
    deleteOrderBriefFile(orderBriefId: string): Promise<void>;
    downloadFiles(fileIds: string[]): Promise<File[]>;
    getFilesWithoutFolder(folderId: string): Promise<File[]>;
    getFilesByFolder(folderId: string): Promise<File[]>;
    verifyItIsOrderFile(orderId: string): Promise<boolean>;
    getMemberFiles(memberId: string): Promise<File[]>;
    getClientFiles(clientId: string): Promise<File[]>;
    getUrlFile(fileId: string): Promise<string>;
}