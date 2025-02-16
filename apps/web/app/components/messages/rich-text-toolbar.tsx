import type { Editor } from '@tiptap/react';
import { Upload } from 'lucide-react';
import { useRef } from 'react';

interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  onFileSelect?: (files: FileList) => void;
}

export const Toolbar = ({ editor, disabled, onFileSelect }: ToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) {
    return null;
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onFileSelect) {
      onFileSelect(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div
      className={`mt-4 flex items-center gap-2 bg-transparent ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      <button
        onClick={handleUploadClick}
        className="flex items-center gap-2 rounded p-1 hover:bg-gray-100"
      >
        <Upload className="h-5 w-5 flex-shrink-0 text-gray-400" />
      </button>
    </div>
  );
};
