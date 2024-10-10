import { Copy, Edit, Trash } from 'lucide-react';

import { useBriefsContext } from '../contexts/briefs-context';

const Options = ({
  formFieldId,
  className,
  ...rest
}: {
  formFieldId: number;
  className?: string;
  [key: string]: unknown;
}) => {
  const { duplicateFormField, removeFormField, editFormField } =
    useBriefsContext();

  const editItem = () => {
    editFormField(formFieldId);
    // You can add any additional logic here related to editing
  };

  const duplicateItem = () => {
    duplicateFormField(formFieldId);
  };

  const removeItem = () => {
    removeFormField(formFieldId);
  };

  const options = new Map([
    [
      'duplicate',
      {
        label: 'Duplicate',
        action: duplicateItem,
        icon: <Copy className="h-5 w-5" />,
      },
    ],
    [
      'edit',
      {
        label: 'Edit',
        action: editItem,
        icon: <Edit className="h-5 w-5" />,
      },
    ],
    [
      'remove',
      {
        label: 'Remove',
        action: removeItem,
        icon: <Trash className="h-5 w-5" />,
      },
    ],
  ]);

  return (
    <div className={`flex gap-2 ${className}`} {...rest}>
      {Array.from(options.values()).map((option, index) => (
        <button
          key={index}
          onClick={option.action}
          className="text-gray-600 hover:text-gray-800"
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
};

export default Options;
