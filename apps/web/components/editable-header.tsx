'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@kit/ui/button';
import { TimerContainer } from '../app/components/timer-container';

interface EditableHeaderProps {
  initialName: string;
  id: string | number;
  userRole: string;
  updateFunction: (value: string) => Promise<void>;
  rolesThatCanEdit: Set<string>;
  variant?: 'chat' | 'default';
  maxWidth?: number;
  maxWindowWidthRatio?: number;
  layoutClassName?: string;
  inputClassName?: string;
  textClassName?: string;
}

const EditableHeader = ({
  initialName,
  id,
  userRole,
  updateFunction,
  rolesThatCanEdit,
  variant = 'default',
  maxWidth = 600,
  maxWindowWidthRatio = 0.6,
  layoutClassName = "flex inline-flex max-h-[60px] w-full items-center justify-between relative w-full",
  inputClassName,
  textClassName,
}: EditableHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    setIsEditing(false);
  }, [id]);

  const handleSave = async () => {
    if (name.trim() === '') {
      toast.error(`The given name cannot be empty`);
      resetEditing();
      return;
    }
    if (name !== initialName) {
      try {
        setIsEditing(false);
        await updateFunction(name);
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
      const maxCalculatedWidth = variant === 'chat'
        ? Math.min(spanWidth, window.innerWidth * 0.5, maxWidth)
        : Math.min(spanWidth, window.innerWidth * maxWindowWidthRatio);
      inputRef.current.style.width = `${maxCalculatedWidth}px`;
    }
  };

  useEffect(() => {
    updateInputWidth();
  }, [name, isEditing]);

  const canEdit = rolesThatCanEdit.has(userRole);

  const getContainerClassName = () => {
    return variant === 'chat'
      ? 'flex-1 flex items-center gap-2 overflow-hidden'
      : 'w-full relative justify-between flex';
  };

  const getInputClassName = () => {
    const baseClass = "items-center overflow-hidden rounded-md border-none bg-slate-50 pr-1 text-[20px] font-semibold text-primary-900 outline-none";
    return variant === 'chat'
      ? `w-full h-15 ${baseClass} ${inputClassName ?? ''}`
      : `h-15 flex min-w-[80%] max-w-[80%] ${baseClass} ${inputClassName ?? ''}`;

  };

  const getTextClassName = () => {
    const baseClass = "text-[20px] font-semibold text-primary-900";
    return variant === 'chat'
      ? `block overflow-hidden text-ellipsis whitespace-nowrap ${baseClass} ${textClassName ?? ''}`
      : `max-w-[100%] overflow-hidden whitespace-nowrap pr-1 w-full ${baseClass} ${textClassName ?? ''}`;

  };

  return (
    <div className={layoutClassName}>
      {canEdit && isEditing ? (
        <div className={getContainerClassName()}>
          {variant === 'chat' ? (
            <>
              <div className="relative flex-1 min-w-0 max-w-[600px] overflow-hidden">
                <input
                  type="text"
                  ref={inputRef}
                  className={getInputClassName()}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <span
                  ref={spanRef}
                  className="invisible absolute left-0 top-0 whitespace-nowrap pr-1 text-[20px] font-semibold text-primary-900"
                >
                  {name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  className="h-10 px-1 text-slate-500"
                  onClick={handleSave}
                >
                  <Check className="h-[20px] w-[20px]" />
                </Button>
                <TimerContainer />
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                ref={inputRef}
                className={getInputClassName()}
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
              <TimerContainer />
            </>
          )}
        </div>
      ) : (
        <div className={getContainerClassName()}>
          {variant === 'chat' ? (
            <>
              <div className="flex-1 min-w-0 max-w-[600px] overflow-hidden">
                <span className={getTextClassName()}>
                  {name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {canEdit && (
                  <Button
                    variant="ghost"
                    className="h-10 px-1 text-slate-500"
                    onClick={() => {
                      setIsEditing(true);
                      updateInputWidth();
                    }}
                  >
                    <PenLine className="h-[20px] w-[20px]" />
                  </Button>
                )}
                <TimerContainer />
              </div>
            </>
          ) : (
            <>
              <span className={getTextClassName()}>
                {name.slice(0, 70).trim()}
                {name.length > 70 && '...'}
              </span>
              {canEdit && (
                <Button
                  variant="ghost"
                  className="m-0 h-10 px-1 text-slate-500"
                  onClick={() => {
                    setIsEditing(true);
                    updateInputWidth();
                  }}
                >
                  <PenLine className="h-[20px] w-[20px]" />
                </Button>
              )}
              <TimerContainer />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableHeader;