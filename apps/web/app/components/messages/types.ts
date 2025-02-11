import { Editor } from '@tiptap/react';
import { Dispatch, SetStateAction } from 'react';

export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  previewUrl?: string;
}

export interface RichTextEditorProps {
  onComplete?: (richText: string, fileIds?: string[]) => void | Promise<void>;
  content?: string;
  onChange?: (richText: string) => void;
  onBlur?: () => void;
  showSubmitButton?: boolean;
  showToolbar?: boolean;
  isEditable?: boolean;
  className?: string;
  onFileUpload?: (file: File, setUploadsFunction: Dispatch<SetStateAction<FileUpload[]>>, fileId: string) => Promise<string>;
}

export interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  onFileSelect?: (files: FileList) => void;
}
