'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@kit/ui/button';
import { Check, PenLine } from 'lucide-react';
import { toast } from 'sonner';

interface EditableHeaderProps {
  initialName: string;
  id: string | number;
  userRole: string;
  updateFunction: (id: string | number, data: Record<string, string>) => Promise<void>;
  rolesThatCanEdit: Set<string>;
  label: string;
  fieldName: string;
}

const EditableHeader = ({
  initialName,
  id,
  userRole,
  updateFunction,
  rolesThatCanEdit,
  label,
  fieldName
}: EditableHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleSave = async () => {
    if (name.trim() === '') {
      toast.error(`${label} cannot be empty`);
      resetEditing();
      return;
    }
    if (name !== initialName) {
      try {
        await updateFunction(id, { [fieldName]: name });
        toast.success(`${label} updated successfully`);
        setIsEditing(false);
      } catch (error) {
        console.error(`Error updating ${label.toLowerCase()}:`, error);
        toast.error(`Error updating ${label.toLowerCase()}`);
      }
    } else {
      resetEditing();
    }
  };

  const resetEditing = () => {
    setIsEditing(false);
    setName(initialName);
  };

  const updateInputWidth = () => {
    if (spanRef.current && inputRef.current) {
      const spanWidth = spanRef.current.offsetWidth;
      inputRef.current.style.width = `${Math.min(spanWidth, window.innerWidth * 0.6)}px`;
    }
  };

  useEffect(() => {
    updateInputWidth();
  }, [name, isEditing]);

  const canEdit = rolesThatCanEdit.has(userRole);

  return (
    <div className="inline-flex w-full max-h-[60px] flex justify-between items-center">
      {canEdit && isEditing ? (
        <>
          <input
            type="text"
            ref={inputRef}
            className="h-15 flex min-w-[98%] items-center justify-between overflow-hidden rounded-md border-none bg-slate-50 text-[20px] max-w-[98%] pr-1 font-semibold text-primary-900 outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <span
            ref={spanRef}
            className="absolute invisible min-w-[80%] whitespace-nowrap overflow-hidden text-[20px] font-semibold text-primary-900 pr-1 max-w-[80%]"
          >
            {name}
          </span>
          <Button variant="ghost" className="mr-2 h-10 m-0 text-slate-500 px-1"  onClick={handleSave}>
            <Check />
          </Button>
        </>
      ) : (
        <>
          <span className=" min-w-[98%] whitespace-nowrap text-[20px] overflow-hidden font-semibold text-primary-900 pr-1 max-w-[98%]">
            {name.slice(0, 70).trim()}
            {name.length > 70 && '...'}
          </span>
          {canEdit && (
            <Button
              variant="ghost"
              className="mr-2 h-10 m-0 text-slate-500 px-1"
              onClick={() => {
                setIsEditing(true);
                updateInputWidth();
              }}
            >
              <PenLine />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default EditableHeader;