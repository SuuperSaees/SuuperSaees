import { Editor } from '@tiptap/react';
import { Dispatch, SetStateAction } from 'react';
import { FileUploadState } from '~/hooks/use-file-upload';

export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error' | 'idle';
  url: string | null;
}

export interface RichTextEditorProps {
  onComplete?: (richText: string, fileUploads?: FileUploadState[], setUploads?: Dispatch<SetStateAction<FileUpload[]>>) => void | Promise<void>;
  content?: string;
  onChange?: (richText: string) => void;
  onBlur?: () => void;
  showSubmitButton?: boolean;
  showToolbar?: boolean;
  isEditable?: boolean;
  className?: string;
  onFileUpload?: (file: File, fileId: string, setUploads: Dispatch<SetStateAction<FileUpload[]>>,) => Promise<string>;
}

export interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  onFileSelect?: (files: FileList) => void;
}
