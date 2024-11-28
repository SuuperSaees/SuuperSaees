'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, PenLine } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { TimerContainer } from '../../web/app/components/timer-container'

interface EditableHeaderProps {
  initialName: string;
  id: string | number;
  userRole: string;
  updateFunction: (value: string
  ) => Promise<void>;
  rolesThatCanEdit: Set<string>;
}

const EditableHeader = ({
  initialName,
  userRole,
  updateFunction,
  rolesThatCanEdit,
}: EditableHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleSave = async () => {
    if (name.trim() === '') {
      toast.error(`The given name cannot be empty`);
      resetEditing();
      return;
    }
    if (name !== initialName) {
      try {
        await updateFunction(name);
        setIsEditing(false);
      } catch (error) {
        console.error(`Error updating the name/title:`, error);
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
    <div className="flex inline-flex max-h-[60px] w-full items-center justify-between">
      {canEdit && isEditing ? (
        <>
          <input
            type="text"
            ref={inputRef}
            className="h-15 flex min-w-[80%] max-w-[80%] items-center justify-between overflow-hidden rounded-md border-none bg-slate-50 pr-1 text-[20px] font-semibold text-primary-900 outline-none"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <span
            ref={spanRef}
            className="invisible absolute min-w-[80%] max-w-[80%] overflow-hidden whitespace-nowrap pr-1 text-[20px] font-semibold text-primary-900"
          >
            {name}
          </span>
          <Button
            variant="ghost"
            className="m-0 mr-2 h-10 px-1 text-slate-500"
            onClick={handleSave}
          >
            <Check className="h-[20px] w-[20px]" />
          </Button>
        </>
      ) : (
        <>
          <span className="min-w-[80%] max-w-[80%] overflow-hidden whitespace-nowrap pr-1 text-[20px] font-semibold text-primary-900">
            {name.slice(0, 70).trim()}
            {name.length > 70 && '...'}
          </span>
          <TimerContainer />
          {canEdit && (
            <Button
              variant="ghost"
              className="m-0 mr-2 h-10 px-1 text-slate-500"
              onClick={() => {
                setIsEditing(true);
                updateInputWidth();
              }}
            >
              <PenLine className="h-[20px] w-[20px]" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default EditableHeader;
