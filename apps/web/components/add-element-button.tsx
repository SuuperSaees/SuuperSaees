import { Plus } from 'lucide-react';

interface AddElementProps {
  message: string;
  buttonAction: () => void;
}

function AddElementButton({ message, buttonAction }: AddElementProps) {
  return (
    <div
      className="custom-dashed-border relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg p-4 text-sm text-gray-500 hover:bg-gray-50"
      onClick={buttonAction}
    >
      <Plus className="h-5 w-5" />
      <p>{message}</p>
    </div>
  );
}

export default AddElementButton;
