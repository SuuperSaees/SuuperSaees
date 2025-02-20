import { File } from '~/lib/file.types';

type CreateFileProps = Omit<File.Insert, 'user_id'>;

export interface ICreateFile {
    files: CreateFileProps[],
    client_organization_id?: string,
    currentPath?: Array<{ title: string; uuid?: string }>,
}
export interface IFilesAction {
    /**    * Creates a new file in the system
    * @param createFileProps The file to be created
    *   @param {CreateFileProps[]} files - Array of files to create
    *   @param {string} [client_organization_id] - Optional organization ID
    *   @param {Array<{title: string, uuid?: string}>} [currentPath] - Optional navigation path
    * @returns {Promise<File.Type[]>} Array of created files
    */
   createFile(createFileProps: ICreateFile): Promise<File.Type[]>;
    /**
    * Retrieves a file by its ID
    * @param fileId The ID of the file to retrieve
    * @returns Promise with the file data
    */
   getFile(fileId: string): Promise<File.Type>;
    /**
    * Updates an existing file
    * @param fileId The ID of the file to update
    * @param file The new file data
    * @returns Promise with the updated file
    */
   updateFile(fileId: string, file: File): Promise<File>;
    /**
    * Deletes a file from the system
    * @param fileId The ID of the file to delete
    */
   deleteFile(fileId: string): Promise<void>;
    // Listing Operations
   /**
    * Retrieves all files in the system
    * @returns Promise with array of files
    */
   getFiles(): Promise<File[]>;
    /**
    * Gets files that are not in a specific folder
    * @param folderId The folder ID to exclude
    * @returns Promise with array of files not in the specified folder
    */
   getFilesWithoutFolder(folderId: string): Promise<File[]>;
    /**
    * Gets all files within a specific folder
    * @param folderId The folder ID to search in
    * @returns Promise with array of files in the specified folder
    */
   getFilesByFolder(folderId: string): Promise<File[]>;
    /**
    * Retrieves all files associated with a specific member
    * @param memberId The ID of the member
    * @returns Promise with array of member's files
    */
   getMemberFiles(memberId: string): Promise<File[]>;
    /**
    * Retrieves all files associated with a specific client
    * @param clientId The ID of the client
    * @returns Promise with array of client's files
    */
   getClientFiles(clientId: string): Promise<File[]>;
    // URL and Bucket Operations
   /**
    * Creates a URL for uploading a file to the bucket
    * @param file The file to create upload URL for
    * @returns Promise with the upload URL
    */
   createUploadBucketURL(file: File): Promise<string>;
    /**
    * Gets the URL for accessing a file
    * @param fileId The ID of the file to get URL for
    * @returns Promise with the file's URL
    */
   getUrlFile(fileId: string): Promise<string>;
    // Order Related Operations
   /**
    * Deletes a file associated with an order brief
    * @param orderBriefId The ID of the order brief
    */
   deleteOrderBriefFile(orderBriefId: string): Promise<void>;
    /**
    * Verifies if a file is associated with an order
    * @param orderId The ID of the order to verify
    * @returns Promise with boolean indicating if file is associated with order
    */
   verifyItIsOrderFile(orderId: string): Promise<boolean>;
    // Download Operations
   /**
    * Downloads multiple files by their IDs
    * @param fileIds Array of file IDs to download
    * @returns Promise with array of downloaded files
    */
   downloadFiles(fileIds: string[]): Promise<File[]>;
}

