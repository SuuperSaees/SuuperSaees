'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
import Heading from '@tiptap/extension-heading';
import Placeholder from '@tiptap/extension-placeholder';
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
  Quote,
  SendHorizontalIcon,
} from 'lucide-react';

// import { useForm } from 'react-hook-form';
// import { z } from 'zod';

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
// } from '@kit/ui/form';

// const richEditorSchema = z.object({
//   content: z.string(),
// });

// const RichTextEditor = () => {
//   const form = useForm<z.infer<typeof richEditorSchema>>({
//     resolver: zodResolver(richEditorSchema),
//     mode: 'onChange',
//     defaultValues: {
//       content: '',
//     },
//   });

//   const onSubmit = (values: z.infer<typeof richEditorSchema>) => {
//     console.log(values);
//   };

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)}>
//         <FormField
//           control={form.control}
//           name="content"
//           render={() => {
//             return (
//               <FormItem>
//                 <FormLabel>
//                   <FormControl>s</FormControl>
//                 </FormLabel>
//               </FormItem>
//             );
//           }}
//         />
//       </form>
//     </Form>
//   );
// };
// export default RichTextEditor;

/* eslint-disable @typescript-eslint/no-unsafe-call */

interface RichTextEditorProps {
  onComplete: (richText: string) => void | Promise<void>;
  content?: string;
  onChange?: (richText: string) => void;
}
const RichTextEditor = ({ content, onComplete }: RichTextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure(),
      Heading.configure({
        HTMLAttributes: {
          class: 'text-xl font-bold',
          levels: [2],
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
    content,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      // disable eslint for eslint@typescript-eslint/no-unsafe-call

      // onChange(editor.getHTML());

      console.log(editor.getHTML());
    },
  });

  return (
    <div className="relative flex flex-col gap-4 rounded border border-input p-4">
      <EditorContent editor={editor} />
      <Toolbar editor={editor} />
      <button
        className="bg-purple absolute bottom-2 right-2 h-fit w-fit rounded-md bg-black p-2 shadow-sm"
        onClick={() => onComplete(editor ? editor.getHTML() : '')}
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
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-5 w-5 text-gray-400" />
      </button>

      <button
        className={editor.isActive('bold') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-5 w-5 text-gray-400" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        <Bold className="h-4 w-4 text-gray-400" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        <Italic className="h-4 w-4 text-gray-400" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        <List className="h-5 w-5 text-gray-400" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        <Quote className="h-4 w-4 text-gray-400" />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={editor.isActive('horizontalRule') ? 'is-active' : ''}
      >
        <File className="h-4 w-4 text-gray-400" />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={editor.isActive('horizontalRule') ? 'is-active' : ''}
      >
        <Image className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  );
};

export default RichTextEditor;