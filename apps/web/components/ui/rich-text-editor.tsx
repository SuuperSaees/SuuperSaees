'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef } from 'react';

import Heading from '@tiptap/extension-heading';
import { Image as ImageInsert } from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import {
  Editor,
  EditorContent,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
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

import styles from './styles.module.css';

interface GroupedImageNodeViewProps {
  node: {
    attrs: {
      src: string;
      alt?: string;
      [key: string]: unknown;
    };
  };
  editor: Editor;
  cleanupFunction?: () => void; // Optional cleanup function
}

const GroupedImageNodeView = ({
  node,
  editor,
  // cleanupFunction,
}: GroupedImageNodeViewProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const originalImage = wrapperRef.current.querySelector('img');

    // If the image is already cloned, do nothing
    if (originalImage && originalImage.dataset.cloned === 'true') {
      return;
    }

    // Clone the image and mark it as cloned
    const clonedImage = originalImage?.cloneNode(true) as HTMLElement;
    clonedImage.style.visibility = 'visible';
    clonedImage.style.position = 'static';
    clonedImage.removeAttribute('data-cloned');
    clonedImage.classList.add('cloned-img');

    // Mark the original image to prevent further cloning
    if (originalImage) {
      originalImage.style.visibility = 'hidden';
      originalImage.style.position = 'absolute';
      originalImage.dataset.cloned = 'true';
    }

    let parentDiv = document.querySelector('.image-group');

    if (!parentDiv) {
      // If no group exists, create a new one
      parentDiv = document.createElement('div');
      parentDiv.classList.add('image-group', `${styles['image-group']}`);
      editor.view.dom.appendChild(parentDiv);
    }

    // Append the cloned image to the existing or newly created group
    parentDiv.appendChild(clonedImage);

    // Call cleanup function if provided
    // if (cleanupFunction) {
    //   cleanupFunction();
    // }
  }, [editor]);
  /* eslint-disable @next/next/no-img-element */
  return (
    <NodeViewWrapper ref={wrapperRef} as="div">
      <img {...node?.attrs} className="cloned-image" />
    </NodeViewWrapper>
  );
};

interface RichTextEditorProps {
  onComplete: (richText: string) => void | Promise<void>;
  content?: string;
  onChange?: (richText: string) => void;
  uploadFileIsExternal?: boolean;
  toggleExternalUpload?: () => void;
}
const IMAGE_URL_REGEX = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|svg))/gi;
function extractImageUrls(text: string) {
  const matches = text.match(IMAGE_URL_REGEX);
  return matches ?? []; // Return an empty array if no matches are found
}

const RichTextEditor = ({
  content,
  onComplete,
  uploadFileIsExternal,
  toggleExternalUpload,
}: RichTextEditorProps) => {
  const insertedImages = useRef(new Set<string>());

  const cleanupImages = () => {
    const clonedImages = document.querySelectorAll('.cloned-img');
    clonedImages.forEach((img) => img.remove());

    // Remove the parent div if it's empty
    const parentDiv = document.querySelector('.image-group');
    if (parentDiv && parentDiv.children.length === 0) {
      parentDiv.remove();
    }
  };

  const debounce = (func: (...args: string[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: string[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const debounceHandleImageUrl = useCallback((editor: Editor) => {
    return debounce((text: string) => {
      const imagesInText = extractImageUrls(text);

      // insert image node for each ulr of image found
      imagesInText.forEach((image) => {
        if (!insertedImages.current.has(image)) {
          editor.chain().focus().setImage({ src: image }).run();
          insertedImages.current.add(image);
        }
      });
    }, 500);
  }, []);

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
        controls: true,
        nocookie: true,
        height: 320,
        HTMLAttributes: {
          class: 'aspect-video w-auto rounded-md',
        },
      }),
      // ImageWrapperNode,
      ImageInsert.configure({
        inline: true,
        HTMLAttributes: {
          class: 'rounded-md max-h-[400px] h-full w-auto object-cover ',
        },
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(GroupedImageNodeView);
        },
      }),

      Link.configure({
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),

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
    content: content ?? '<p></p>',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
      },

      // handleKeyDown: (_, event) => {
      //   if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey) {
      //     event.preventDefault();
      //     sendContent();
      //     return true;
      //   }
      //   return false;
      // },
    },
    onUpdate({ editor }) {
      const text = editor.getText();
      const imagesInText = extractImageUrls(text);
      imagesInText && debounceHandleImageUrl(editor)(text);
    },
  });

  const sendContent = useCallback(() => {
    void (async () => {
      try {
        cleanupImages();
        const content = editor ? editor.getHTML() : '';
        editor?.commands.clearContent();
        await onComplete(content);
        insertedImages.current = new Set<string>();
      } finally {
        // cleanupImages();
      }
    })();
  }, [editor, onComplete]);

  // Implement sanitizer to ensure the content to be nested is secure before sending to server

  return (
    <div className="relative flex flex-col gap-4 rounded border border-input p-4">
      <EditorContent
        editor={editor}
        className={styles['image-input-text-editor'] + 'h-fit w-full'}
      />
      <Toolbar
        editor={editor}
        toggleExternalUpload={toggleExternalUpload}
        uploadFileIsExternal={uploadFileIsExternal}
      />
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
  uploadFileIsExternal?: boolean;
  toggleExternalUpload?: () => void;
}

export const Toolbar = ({
  editor,
  uploadFileIsExternal,
  toggleExternalUpload,
}: ToolbarProps) => {
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
        onClick={
          uploadFileIsExternal && toggleExternalUpload
            ? () => toggleExternalUpload()
            : undefined
        }
        className={editor.isActive('image') ? 'text-gray-700' : 'text-gray-400'}
      >
        <Image className="h-4 w-4" />
      </button>
    </div>
  );
};

export default RichTextEditor;