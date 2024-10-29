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
  Extension,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react';
import { NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
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
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';

import { Switch } from '@kit/ui/switch';
import { Trans } from '@kit/ui/trans';

import useInternalMessaging from '../../app/orders/[id]/hooks/use-messages';
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

const GroupedImageNodeView = ({ node, editor }: GroupedImageNodeViewProps) => {
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

    // Assign a unique ID to the cloned image
    const imageId = `img-${Math.random().toString(36).substring(2, 9)}`;
    clonedImage.id = imageId;

    // Create a wrapper div to hold the image and delete button
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('relative', 'cloned-image-wrapper');

    // Move the cloned image into the wrapper
    imageWrapper.appendChild(clonedImage);

    // Create the delete button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add(
      'absolute',
      'right-2',
      'top-1',
      'cursor-pointer',
      'text-white/80',
      'hover:text-white/100',
    );

    // Add the "X" icon inside the delete button
    deleteButton.innerHTML = '<span>X</span>';

    // Attach the delete function to the button
    deleteButton.addEventListener('click', () => {
      imageWrapper.remove();
    });

    // Append the delete button to the image wrapper
    imageWrapper.appendChild(deleteButton);

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

    // Append the image wrapper (with the image and delete button) to the group
    parentDiv.appendChild(imageWrapper);

    // Clean up the DOM when the component unmounts
    // return () => {
    //   if (imageWrapper) {
    //     imageWrapper.remove();
    //   }
    // };
  }, [editor]);

  /* eslint-disable @next/next/no-img-element */
  return (
    <NodeViewWrapper ref={wrapperRef} as="div" className="relative">
      <img {...node?.attrs} className="cloned-image" />
    </NodeViewWrapper>
  );
};

interface RichTextEditorProps {
  onComplete?: (richText: string) => void | Promise<void>;
  content?: string;
  onChange?: (richText: string) => void;
  onBlur?: () => void;
  uploadFileIsExternal?: boolean;
  toggleExternalUpload?: () => void;
  userRole: string;
  hideSubmitButton?: boolean;
  useInForm?: boolean;
  showToolbar?: boolean;
  isEditable?: boolean;
}
const IMAGE_URL_REGEX = /(https?:\/\/\S+\.(?:png|jpg|jpeg|gif|svg))/gi;
function extractImageUrls(text: string) {
  const matches = text.match(IMAGE_URL_REGEX);
  return matches ?? []; // Return an empty array if no matches are found
}

// TODO: remove not related logic for this presentation component !IMPORTANT- TECHDEBT
const RichTextEditorV2 = ({
  content,
  onComplete,
  onChange,
  onBlur,
  uploadFileIsExternal,
  toggleExternalUpload,
  userRole,
  hideSubmitButton = false,
  showToolbar = true,
  isEditable = true,
  // useInForm = false,
}: RichTextEditorProps) => {
  const insertedImages = useRef(new Set<string>());
  const cleanupImages = () => {
    // Select all image wrappers
    const imageWrappers = document.querySelectorAll('.cloned-image-wrapper');

    // Remove each image wrapper (which includes the image and the delete button)
    imageWrappers.forEach((wrapper) => wrapper.remove());

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

  const CustomShortcuts = Extension.create({
    addKeyboardShortcuts() {
      return {
        // Send content on Enter
        // Enter: () => {
        //   sendContent();
        //   return true;
        // },
        // Insert new paragraph on Ctrl + Enter or Cmd + Enter
        'Mod-Enter': () => {
          this.editor.commands.splitBlock();
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    immediatelyRender: true,
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
          class: 'text-brand underline',
        },
      }),

      Placeholder.configure({
        // Use a placeholder:
        placeholder: 'Write a message...',
      }),
      CustomShortcuts,
    ],
    content: content ?? '<p></p>',
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
      },
      handleKeyDown: (_, event) => {
        if (
          !onChange &&
          event.key === 'Enter' &&
          !event.shiftKey &&
          !event.ctrlKey
        ) {
          event.preventDefault();
          sendContent();
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      const text = editor.getText();
      const imagesInText = extractImageUrls(text);
      imagesInText && debounceHandleImageUrl(editor)(text);
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    onBlur: () => {
      onBlur?.();
    },
  });
  const sendContent = useCallback(() => {
    void (async () => {
      try {
        cleanupImages();
        const content = editor ? editor.getHTML() : '';
        // <p></p> is the default content of the editor
        if (content.trim() === '<p></p>') {
          return;
        }
        editor?.commands.clearContent();
        onComplete && (await onComplete(content));
        if (onChange) {
          onChange(content);
        }
        insertedImages.current = new Set<string>();
      } finally {
        // cleanupImages();
      }
    })();
  }, [editor, onComplete, onChange]);

  // Implement sanitizer to ensure the content to be nested is secure before sending to server

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
      editor.commands.focus();
    }
  }, [editor]);

  return (
    <div className="relative grid h-fit w-full grid-rows-[1fr_auto] gap-1 rounded-2xl p-4">
      <div>
        {showToolbar && (
          <Toolbar
            editor={editor}
            toggleExternalUpload={toggleExternalUpload}
            uploadFileIsExternal={uploadFileIsExternal}
            userRole={userRole}
            onChange={onChange}
          />
        )}
        {!hideSubmitButton && (
          <ThemedButton
            className="absolute bottom-2 right-2 h-fit w-fit rounded-xl p-2 shadow-sm"
            onClick={sendContent}
          >
            <SendHorizontalIcon className="h-5 w-5 -rotate-45 text-white" />
          </ThemedButton>
        )}
      </div>
      <div
        onClick={() => editor?.commands.focus()}
        className={`${styles['scrollbar-thin']} relative h-fit w-full overflow-y-hidden border-none bg-transparent pb-0 outline-none placeholder:pb-4 placeholder:pl-4 placeholder:text-gray-400`}
      >
        {editor?.getHTML().trim() === '<p></p>' && !editor?.isFocused ? (
          <span className="absolute left-2 top-4 -translate-y-1/2 transform text-gray-400">
            <Trans i18nKey="placeholder" />
          </span>
        ) : null}
        <EditorContent
          editor={editor}
          className={`${styles['scrollbar-thin']} flex h-fit max-h-96 w-full flex-col-reverse overflow-y-auto whitespace-normal placeholder:text-gray-400`}
        />
      </div>
      
    </div>
  );
};
interface ToolbarProps {
  userRole: string;
  editor: Editor | null;
  uploadFileIsExternal?: boolean;
  toggleExternalUpload?: () => void;
  onChange?: (richText: string) => void;
}

export const Toolbar = ({
  userRole,
  editor,
  uploadFileIsExternal,
  toggleExternalUpload,
  onChange,
}: ToolbarProps) => {
  const { isInternalMessagingEnabled, handleSwitchChange } =
    useInternalMessaging();

  if (!editor) {
    return null;
  }
  return (
    <div className="flex items-center gap-2 bg-transparent">
      <button
        type="button"
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
        type="button"
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
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'text-gray-700' : 'text-gray-400'}
      >
        <Bold className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={
          editor.isActive('strike') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <Strikethrough className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive('italic') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive('bulletList') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <List className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive('orderedList') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <ListOrdered className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive('blockquote') ? 'text-gray-700' : 'text-gray-400'
        }
      >
        <Quote className="h-4 w-4" />
      </button>

      {!onChange && (
        <>
          <button
            type="button"
            onClick={
              uploadFileIsExternal && toggleExternalUpload
                ? () => toggleExternalUpload()
                : undefined
            }
            className={
              editor.isActive('image') ? 'text-gray-700' : 'text-gray-400'
            }
          >
            <Image className="h-4 w-4" />
          </button>
          {['agency_member', 'agency_project_manager', 'agency_owner'].includes(
            userRole,
          ) && (
            <button
              onClick={handleSwitchChange}
              className={
                isInternalMessagingEnabled ? 'text-gray-700' : 'text-gray-400'
              }
            >
              <Switch checked={isInternalMessagingEnabled} />
            </button>
          )}
          {['agency_member', 'agency_project_manager', 'agency_owner'].includes(
            userRole,
          ) &&
            isInternalMessagingEnabled && (
              <span className="text-gray-400">
                <Trans i18nKey="internalMessagingEnabled" />
              </span>
            )}
        </>
      )}
    </div>
  );
};

export default RichTextEditorV2;
