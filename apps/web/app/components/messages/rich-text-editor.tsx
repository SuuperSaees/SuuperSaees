"use client";

import { useCallback, useRef, useState } from "react";

import { EditorContent } from "@tiptap/react";
import { SendHorizontal } from "lucide-react";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";

import { Trans } from "@kit/ui/trans";

import { useRichTextEditor } from "~/hooks/use-rich-text-editor";

import { FileUploadPreview } from "./file-upload-preview";
import { Toolbar } from "./rich-text-toolbar";
import styles from "./styles.module.css";
import { RichTextEditorProps } from "./types";
import { FileUpload } from "./types";

const RichTextEditor = ({
  content,
  onComplete,
  onChange,
  onBlur,
  onFileUpload,
  showSubmitButton = true,
  showToolbar = true,
  isEditable = true,
  className = "",
  customActionButtons,
  onFileRemove,
  ...rest
}: RichTextEditorProps) => {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentUploadIds = useRef<Set<string>>(new Set());
  const cancelledUploadIds = useRef<Set<string>>(new Set());

  const { editor, insertedImages } = useRichTextEditor({
    content,
    onChange,
    onBlur,
    isEditable,
  });

  const cleanupImages = useCallback(() => {
    const imageWrappers = document.querySelectorAll(".cloned-image-wrapper");
    imageWrappers.forEach((wrapper) => wrapper.remove());
    const parentDiv = document.querySelector(".image-group");
    if (parentDiv?.children.length === 0) {
      parentDiv.remove();
    }
  }, []);

  const sendContent = useCallback(() => {
    void (async () => {
      const currentContent = editor ? editor.getHTML() : "";
      const currentUploads = [...uploads];

      try {
        // Mark current uploads as sent so they won't reappear
        currentUploads.forEach((upload) => {
          sentUploadIds.current.add(upload.id);
        });

        cleanupImages();
        editor?.commands.clearContent();
        setUploads([]);

        if (
          currentContent.replace(/<p>\s*<\/p>/, "").trim() !== "" ||
          currentUploads.length > 0
        ) {
          await onComplete?.(currentContent, currentUploads, setUploads);
          insertedImages.current = new Set<string>();
        }
      } catch (error) {
        console.error("Error sending content:", error);
        // On error, remove the sent upload IDs so they can be retried
        currentUploads.forEach((upload) => {
          sentUploadIds.current.delete(upload.id);
        });
      }
    })();
  }, [editor, onComplete, cleanupImages, insertedImages, uploads]);

  const handleFileSelect = async (files: FileList) => {
    if (!onFileUpload) return;

    // Process all files in parallel
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        await onFileUpload(file, (updatedUpload: FileUpload) => {
          // Only update if this upload hasn't been sent or cancelled
          if (!sentUploadIds.current.has(updatedUpload.id) && !cancelledUploadIds.current.has(updatedUpload.id)) {
            setUploads((prev) => {
              const existingUpload = prev.find(
                (upload) => upload.id === updatedUpload.id,
              );
              if (existingUpload) {
                return prev.map((upload) =>
                  upload.id === updatedUpload.id ? updatedUpload : upload,
                );
              } else {
                return [...prev, updatedUpload];
              }
            });
          }
        });
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    });

    // Wait for all uploads to complete
    await Promise.allSettled(uploadPromises);
  };

  const removeUpload = (id: string) => {
    // Mark as cancelled to prevent future progress updates from re-adding it
    cancelledUploadIds.current.add(id);
    
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id);
      if (upload?.url) {
        URL.revokeObjectURL(upload.url);
      }
      return prev.filter((u) => u.id !== id);
    });
    
    // Also remove from sent uploads if it was manually removed
    sentUploadIds.current.delete(id);
    void onFileRemove?.(id);
  };

  const dragCounter = useRef(0);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      void handleFileSelect(files);
    }
  };
  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex h-fit w-full flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 ${
        isDragging ? "border-blue-500 bg-blue-50" : ""
      } ${className}`}
      {...rest}
    >
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-blue-100 bg-opacity-75">
          <p className="text-blue-700 font-semibold">
            Drop files here to upload
          </p>
        </div>
      )}

      <input
        type="file"
        multiple
        accept="*/*"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            void handleFileSelect(e.target.files);
          }
        }}
      />

      <div
        onClick={() => editor?.commands.focus()}
        className={`${styles["scrollbar-thin"]} relative h-fit w-full overflow-y-hidden border-none bg-transparent pb-0 outline-none placeholder:pb-4 placeholder:pl-4 placeholder:text-gray-400`}
      >
        {editor?.getHTML().trim() === "<p></p>" && !editor?.isFocused && (
          <span className="absolute h-[40px] min-h-[40px] transform text-gray-400">
            <Trans i18nKey="placeholder" />
          </span>
        )}
        <EditorContent
          editor={editor}
          className={`${styles["scrollbar-thin"]} flex h-full max-h-60 w-full flex-col-reverse overflow-y-auto whitespace-normal placeholder:text-gray-400`}
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
              onFileSelect={(files) => {
                if (files) void handleFileSelect(files);
              }}
            />
          )}

          {showSubmitButton && (
            <ThemedButton
              className="mt-4 flex h-9 w-9 items-center justify-center rounded-[var(--radius-md,8px)] shadow-none"
              onClick={sendContent}
              disabled={
                editor
                  ?.getHTML()
                  .replace(/<[^>]*>/g, "")
                  .trim() === "" && uploads.length === 0
              }
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
