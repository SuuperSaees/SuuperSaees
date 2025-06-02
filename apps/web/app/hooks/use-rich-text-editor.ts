'use client';

import { useCallback, useEffect, useRef } from 'react';

import Heading from '@tiptap/extension-heading';
import { Image as ImageInsert } from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import type { Editor } from '@tiptap/react';
import { Extension, useEditor } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import GroupedImageNodeView from '../components/messages/image-node-wrapper';

// Regex to match image URLs in text
const IMAGE_URL_REGEX = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|svg))/gi;

/**
 * Extracts image URLs from text content
 * @param text - The text to extract URLs from
 * @returns Array of matched image URLs or empty array
 */
const extractImageUrls = (text: string) => {
  const matches = text.match(IMAGE_URL_REGEX);
  return matches ?? [];
};

interface UseRichTextEditorProps {
  content?: string;
  onChange?: (richText: string) => void;
  onBlur?: () => void;
  isEditable?: boolean;
}


/**
 * Custom hook for rich text editor functionality
 * Handles image insertion, keyboard shortcuts, and editor configuration
 */
export const useRichTextEditor = ({
  content,
  onChange,
  onBlur,
  isEditable = true,
}: UseRichTextEditorProps) => {
  // Track inserted images to prevent duplicates
  const insertedImages = useRef(new Set<string>());

  // Standard debounce implementation
  const debounce = useCallback(
    (func: (...args: string[]) => void, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: string[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },
    [],
  );

  // Debounced handler for processing image URLs in text
  const debounceHandleImageUrl = useCallback(
    (editor: Editor) => {
      return debounce((text: string) => {
        const imagesInText = extractImageUrls(text);
        imagesInText.forEach((image) => {
          if (!insertedImages.current.has(image)) {
            editor.chain().focus().setImage({ src: image }).run();
            insertedImages.current.add(image);
          }
        });
      }, 500);
    },
    [debounce],
  );

  // Custom keyboard shortcuts extension
  const CustomShortcuts = Extension.create({
    addKeyboardShortcuts() {
      return {
        // Insert line break on Ctrl + Enter or Cmd + Enter
        'Mod-Enter': () => {
          this.editor.commands.setHardBreak();
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: { class: 'list-disc pl-4' },
        },
        orderedList: {
          HTMLAttributes: { class: 'list-decimal pl-4' },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              'relative border-l-2 pl-4 italic mx-4 my-2 before:content-["\\""] before:text-2xl before:font-bold before:absolute before:left-0 before:transform before:-translate-x-0 inline-block',
          },
        },
        hardBreak: {
          HTMLAttributes: {
            class: 'inline-block',
          },
        },
      }),
      Heading.configure({
        HTMLAttributes: {
          class: 'text-xl font-bold',
          levels: [2],
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        height: 320,
        HTMLAttributes: {
          class: 'aspect-video w-auto rounded-md',
        },
      }),
      ImageInsert.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-md max-h-[400px] h-full w-auto object-cover',
        },
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(GroupedImageNodeView);
        },
      }),
      Link.configure({
        autolink: true,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Placeholder.configure({
        placeholder: 'Write a message...',
      }),
      CustomShortcuts,
    ],
    content: content ?? '<p></p>',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none text-sm [&>p]:mb-4 last:[&>p]:mb-0 [&>p]:leading-relaxed',
      },
      handleKeyDown: (_, event) => {
        if (event.key === 'Enter' && event.ctrlKey) {
          editor?.commands.setHardBreak();
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      const text = editor.getText();
      const imagesInText = extractImageUrls(text);
      imagesInText && debounceHandleImageUrl(editor)(text);
      onChange?.(editor.getHTML());
    },
    onBlur,
  });

  // Set editor editable state and focus
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
      editor.commands.focus();
    }
  }, [editor, isEditable]);

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content ?? '');
    }
  }, [content, editor]);

  return { editor, insertedImages };
};
