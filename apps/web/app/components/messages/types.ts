import { Editor } from '@tiptap/react';
import { Dispatch, SetStateAction } from 'react';

export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error' | 'idle';
  url: string | null;
}

export interface RichTextEditorProps {
  onComplete?: (richText: string, fileUploads?: FileUpload[], setUploads?: Dispatch<SetStateAction<FileUpload[]>>) => void | Promise<void>;
  content?: string;
  onChange?: (richText: string) => void;
  onBlur?: () => void;
  showSubmitButton?: boolean;
  showToolbar?: boolean;
  isEditable?: boolean;
  className?: string;
  onFileUpload?: (file: File, onProgress: (upload: FileUpload) => void) => Promise<string> | Promise<void>;
  onFileRemove?: (id: string) => Promise<void> | void;
  customActionButtons?: ((editor: Editor) => JSX.Element)[];
}

export interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  onFileSelect?: (files: FileList) => void;
}
