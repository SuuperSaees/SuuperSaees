import { Copy, Pencil, Trash2 } from 'lucide-react';

import { useBriefsContext } from '../contexts/briefs-context';

const Options = ({
  formFieldId,
  className,
  ...rest
}: {
  formFieldId: string;
  className?: string;
  [key: string]: unknown;
}) => {
  const { duplicateFormField, removeFormField, editFormField, updateBriefFormFields } =
    useBriefsContext();

  const editItem = () => {
    editFormField(formFieldId);
    // You can add any additional logic here related to editing
  };

  const duplicateItem = async () => {
    try {
      const newFormFields = duplicateFormField(formFieldId);
      await updateBriefFormFields(newFormFields);
    } catch (error) {
      console.error('Failed to update form fields from client')
    }
  };

  const removeItem = async () => {
    try {
      const newFormFields = removeFormField(formFieldId);
      await updateBriefFormFields(newFormFields);
    } catch (error) {
      console.error('Failed to update form fields from client')
    }
  };

  const options = new Map([
    [
      'duplicate',
      {
        label: 'Duplicate',
        action: () => void (duplicateItem()),
        icon: <Copy className="h-5 w-5 text-[#667085]" />,
      },
    ],
    [
      'edit',
      {
        label: 'Edit',
        action: () => void (editItem()),
        icon: <Pencil className="h-5 w-5 text-[#667085]" />,
      },
    ],
    [
      'remove',
      {
        label: 'Remove',
        action: () => void (removeItem()),
        icon: <Trash2 className="h-5 w-5 text-[#667085]" />,
      },
    ],
  ]);

  return (
    <div className={`flex bg-[#FFFFFF] p-2 rounded-md gap-2 ${className}`} {...rest}>
      {Array.from(options.values()).map((option, index) => (
        <button
          key={index}
          onClick={option.action}
          type='button'
          className="text-gray-600 hover:text-gray-800"
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};

export default Options;
