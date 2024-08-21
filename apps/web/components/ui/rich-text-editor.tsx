'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';

import Heading from '@tiptap/extension-heading';
import { Image as ImageInsert } from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  File,
  Heading1,
  Heading2,
  Image,
  Italic,
  List,
  ListOrdered,
  Quote,
  SendHorizontalIcon,
  Strikethrough,
} from 'lucide-react';

interface RichTextEditorProps {
  onComplete: (richText: string) => void | Promise<void>;
  content?: string;
  onChange?: (richText: string) => void;
}
const RichTextEditor = ({ content, onComplete }: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4',
          },
        },
        // custom style for block quote
        blockquote: {
          HTMLAttributes: {
            class: `relative border-l-2 pl-4 italic mx-4 my-2 
              before:content-['“'] before:text-2xl before:font-bold before:absolute 
              before:left-0 before:transform before:-translate-x-0
              inline-block
            `,
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
        controls: false,
        nocookie: true,
      }),

      ImageInsert.configure(),

      Placeholder.configure({
        // Use a placeholder:
        placeholder: 'Write a message...',

        // Use different placeholders depending on the node type:
        // placeholder: ({ node }) => {
        //   if (node.type.name === 'heading') {
        //     return 'What’s the title?'
        //   }

        //   return 'Can you add some further context?'
        // },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
      },

      handleKeyDown: (_, event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
          event.preventDefault();
          sendContent();
          return true;
        }
        return false;
      },
    },
  });

  const sendContent = useCallback(() => {
    void (async () => {
      const content = editor ? editor.getHTML() : '';
      editor?.commands.clearContent();
      await onComplete(content);
    })();
  }, [editor, onComplete]);

  // Implement sanitizer to ensure the content to be nested is secure before sending to server

  return (
    <div className="relative flex flex-col gap-4 rounded border border-input p-4">
      <EditorContent editor={editor} />
      <Toolbar editor={editor} />
      <button
        className="bg-purple absolute bottom-2 right-2 h-fit w-fit rounded-md bg-black p-2 shadow-sm"
        onClick={sendContent}
      >
        <SendHorizontalIcon className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

interface ToolbarProps {
  editor: Editor | null;
}

export const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) {
    return null;
  }
  return (
    <div className="flex items-center gap-2 bg-transparent">
      <button
        className={
          editor.isActive('heading', { level: 1 })
            ? 'text-gray-700'
            : 'text-gray-400'
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-5 w-5" />
      </button>

      <button
        className={
          editor.isActive('heading', { level: 2 })
            ? 'text-gray-700'
            : 'text-gray-400'
        }
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-5 w-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'text-gray-700' : 'text-gray-400'}
      >
        <Bold className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={
          editor.isActive('strike') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive('italic') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive('bulletList') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <List className="h-5 w-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive('orderedList') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <ListOrdered className="h-5 w-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive('blockquote') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <Quote className="h-4 w-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={
          editor.isActive('horizontalRule') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <File className="h-4 w-4" />
      </button>
      <button
        onClick={() => {
          editor.chain().focus().setImage({ src: editor.getText() }).run();
        }}
        className={editor.isActive('image') ? 'text-gray-700' : 'text-gray-400'}
      >
        <Image className="h-4 w-4" />
      </button>
    </div>
  );
};

export default RichTextEditor;