'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Upload, Paperclip } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { toast } from 'sonner';
import FileUploader from './file-uploader';
import { Spinner } from '@kit/ui/spinner';

interface RichTextEditorProps {
  onComplete: (content: string, fileIds?: string[]) => Promise<void>;
  showToolbar?: boolean;
  isEditable?: boolean;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({
  onComplete,
  showToolbar = true,
  isEditable = true,
  placeholder = 'Type a message...',
  className = '',
}: RichTextEditorProps) => {
  const [isSending, setIsSending] = useState(false);
  const [fileIdsList, setFileIdsList] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileUploadStatus, setFileUploadStatus] = useState<Record<string, { status: 'uploading' | 'completed' | 'error', id?: string }>>({});
  const [thereAreFilesUploaded, setThereAreFilesUploaded] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    editable: isEditable,
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[40px]',
      },
    },
    onUpdate: ({ editor }) => {
      // Optional: Add any on-update handling here
    },
  });

  const sendContent = useCallback(async () => {
    if (!editor) return;

    const content = editor.getHTML();
    if (content === '<p></p>' && fileIdsList.length === 0) return;

    try {
      setIsSending(true);
      await onComplete(content, fileIdsList.length > 0 ? fileIdsList : undefined);
      editor.commands.setContent('');
      setFileIdsList([]);
      setFileUploadStatus({});
      setThereAreFilesUploaded(false);
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [editor, fileIdsList, onComplete]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void sendContent();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sendContent]);

  const fileUploaderRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileUploaderRef.current?.click();
  };

  const handleFileIdsChange = (fileIds: string[]) => {
    setFileIdsList((prevFileIds) => [...prevFileIds, ...fileIds]);
  };

  // File upload status tracking
  const updateFileUploadStatus = (
    file: File,
    status: 'uploading' | 'completed' | 'error',
    serverId?: string,
  ) => {
    setFileUploadStatus((prev) => ({
      ...prev,
      [file.name]: {
        status,
        id: serverId,
      },
    }));
  };

  const areAllFilesUploaded = () => {
    return Object.values(fileUploadStatus).every(
      (file) => file.status === 'completed',
    );
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && fileUploaderRef.current) {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      fileUploaderRef.current.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      fileUploaderRef.current.dispatchEvent(event);
    }
  };

  return (
    <div
      className={`relative grid w-full gap-1 rounded-lg border bg-white p-4 ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          <div className="text-center">
            <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Drop files to attach</p>
          </div>
        </div>
      )}

      <div className="min-h-[100px] max-h-[200px] overflow-y-auto">
        {editor?.getHTML().trim() === '<p></p>' && !editor?.isFocused && (
          <div className="absolute pointer-events-none text-gray-400">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          {showToolbar && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUploadClick}
                type="button"
              >
                <Upload className="h-5 w-5" />
              </Button>
              <FileUploader
                ref={fileUploaderRef}
                onFileIdsChange={handleFileIdsChange}
                onFileUploadStatusUpdate={updateFileUploadStatus}
                thereAreFilesUploaded={setThereAreFilesUploaded}
                className="hidden"
              />
            </>
          )}
        </div>

        <Button
          onClick={sendContent}
          disabled={
            isSending ||
            (!areAllFilesUploaded() && thereAreFilesUploaded) ||
            (editor?.getHTML().trim() === '<p></p>' && fileIdsList.length === 0)
          }
        >
          {isSending ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* File preview area */}
      {fileIdsList.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(fileUploadStatus).map(([fileName, status]) => (
            <div
              key={fileName}
              className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-1 text-sm"
            >
              <span className="truncate max-w-[200px]">{fileName}</span>
              {status.status === 'uploading' && (
                <Spinner className="h-3 w-3" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;