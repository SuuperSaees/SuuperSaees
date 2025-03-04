'use client';

import { useCallback, useState } from 'react';

import { EditorContent } from '@tiptap/react';
import { SendHorizontal } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';

import { Trans } from '@kit/ui/trans';

import { useRichTextEditor } from '~/hooks/use-rich-text-editor';

import { FileUploadPreview } from './file-upload-preview';
import { Toolbar } from './rich-text-toolbar';
import styles from './styles.module.css';
import { RichTextEditorProps } from './types';
import { FileUpload } from './types';

const RichTextEditor = ({
  content,
  onComplete,
  onChange,
  onBlur,
  onFileUpload,
  showSubmitButton = true,
  showToolbar = true,
  isEditable = true,
  className = '',
  customActionButtons,
  ...rest
}: RichTextEditorProps) => {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const { editor, insertedImages } = useRichTextEditor({
    content,
    onChange,
    onBlur,
    isEditable,
  });

  const cleanupImages = useCallback(() => {
    const imageWrappers = document.querySelectorAll('.cloned-image-wrapper');
    imageWrappers.forEach((wrapper) => wrapper.remove());
    const parentDiv = document.querySelector('.image-group');
    if (parentDiv?.children.length === 0) {
      parentDiv.remove();
    }
  }, []);

  const sendContent = useCallback(() => {
    void (async () => {
      const currentContent = editor ? editor.getHTML() : '';
      try {
        cleanupImages();
        editor?.commands.clearContent();
        setUploads([]);
        if (currentContent.replace(/<p>\s*<\/p>/, '').trim() !== '' || uploads.length > 0) {
          await onComplete?.(currentContent, uploads, setUploads);
          insertedImages.current = new Set<string>();
        }
      } catch (error) {
        console.error('Error sending content:', error);
      }
    })();
  }, [editor, onComplete, cleanupImages, insertedImages, uploads]);

  const handleFileSelect = async (files: FileList) => {
    const newUploads: FileUpload[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'uploading',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      try {
        if (!onFileUpload) continue;

        await onFileUpload(upload.file, upload.id, setUploads);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploads((prev) =>
          prev.map((u) => (u.id === upload.id ? { ...u, status: 'error' } : u)),
        );
      }
    }
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id);
      if (upload?.url) {
        URL.revokeObjectURL(upload.url);
      }
      return prev.filter((u) => u.id !== id);
    });
  };

  // console.log('UPLOADS', uploads);
  return (
    <div
      className={`relative flex h-fit w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 ${className}`}
      {...rest}
    >
      <div
        onClick={() => editor?.commands.focus()}
        className={`${styles['scrollbar-thin']} relative h-fit w-full overflow-y-hidden border-none bg-transparent pb-0 outline-none placeholder:pb-4 placeholder:pl-4 placeholder:text-gray-400`}
      >
        {editor?.getHTML().trim() === '<p></p>' && !editor?.isFocused && (
          <span className="absolute h-[40px] min-h-[40px] transform text-gray-400">
            <Trans i18nKey="placeholder" />
          </span>
        )}
        <EditorContent
          editor={editor}
          className={`${styles['scrollbar-thin']} flex h-full max-h-60 w-full flex-col-reverse overflow-y-auto whitespace-normal placeholder:text-gray-400`}
        />
      </div>

      <div className="flex flex-col">
        {uploads.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {uploads.map((upload) => (
              <FileUploadPreview
                key={upload.id}
                upload={upload}
                onRemove={removeUpload}
              />
            ))}
          </div>
        )}
        <div className="flex justify-between">
          {showToolbar && (
            <Toolbar
              editor={editor}
              customActionButtons={customActionButtons}
              onFileSelect={handleFileSelect}
            />
          )}

          {showSubmitButton && (
            <ThemedButton
              className="mt-4 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md,8px)] shadow-none"
              onClick={sendContent}
              disabled={editor?.getHTML().replace(/<[^>]*>/g, '').trim() === '' && uploads.length === 0}
            >
              <SendHorizontal className="h-[20px] w-[20px] flex-shrink-0" />
            </ThemedButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
