"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TimerContainer } from "../app/components/timer-container";
import { PageMobileNavigation } from "@kit/ui/page";
import { HomeMobileNavigation } from "~/(main)/home/(user)/_components/home-mobile-navigation";

interface EditableHeaderProps {
  initialName: string;
  userRole: string;
  updateFunction: (value: string) => Promise<void>;
  rolesThatCanEdit: Set<string>;
  variant?: "chat" | "default";
  maxWidth?: number;
  maxWindowWidthRatio?: number;
  layoutClassName?: string;
  inputClassName?: string;
  textClassName?: string;
}

const EditableHeader = ({
  initialName,
  userRole,
  updateFunction,
  rolesThatCanEdit,
  variant = "default",
  maxWidth = 600,
  maxWindowWidthRatio = 0.6,
  layoutClassName = "flex gap-2 inline-flex max-h-[60px] w-full items-center justify-between relative w-full",
  inputClassName,
  textClassName,
}: EditableHeaderProps) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleSave = async () => {
    if (name.trim() === "") {
      toast.error(`The given name cannot be empty`);
      setName(initialName);
      return;
    }
    if (name !== initialName) {
      try {
        await updateFunction(name);
      } catch (error) {
        console.error(`Error updating the name/title:`, error);
        setName(initialName);
      }
    }
  };

  const updateInputWidth = () => {
    if (spanRef.current && inputRef.current) {
      const spanWidth = spanRef.current.offsetWidth;
      const maxCalculatedWidth =
        variant === "chat"
          ? Math.min(spanWidth, window.innerWidth * 0.5, maxWidth)
          : Math.min(spanWidth, window.innerWidth * maxWindowWidthRatio);
      inputRef.current.style.width = `${maxCalculatedWidth}px`;
    }
  };

  useEffect(() => {
    updateInputWidth();
  }, [name]);

  const canEdit = rolesThatCanEdit.has(userRole);

  const getContainerClassName = () => {
    return variant === "chat"
      ? "flex-1 flex items-center gap-2 overflow-hidden"
      : "w-full relative justify-between flex";
  };

  const getInputClassName = () => {
    const baseClass =
      "items-center overflow-hidden rounded-md border-none bg-slate-50 pr-1 text-xl font-medium font-inter leading-4 text-primary-900 outline-none bg-transparent";
    return variant === "chat"
      ? `w-full h-15 ${baseClass} ${inputClassName ?? ""}`
      : `h-15 flex min-w-[80%] max-w-[80%] ${baseClass} ${inputClassName ?? ""}`;
  };

  const getTextClassName = () => {
    const baseClass = "text-xl font-medium font-inter leading-4";
    return variant === "chat"
      ? `block overflow-hidden text-ellipsis whitespace-nowrap ${baseClass} ${textClassName ?? ""}`
      : `max-w-[100%] overflow-hidden whitespace-nowrap pr-1 w-full ${baseClass} ${textClassName ?? ""}`;
  };

  if (!canEdit) {
    return (
      <div className={layoutClassName}>
        <PageMobileNavigation
          className={"flex items-center justify-between w-fit"}
        >
          <HomeMobileNavigation />
        </PageMobileNavigation>
        <div className={getContainerClassName()}>
          {variant === "chat" ? (
            <>
              <div className="flex-1 min-w-0 max-w-[600px] overflow-hidden">
                <span className={getTextClassName()}>{name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <TimerContainer />
              </div>
            </>
          ) : (
            <>
              <span className={getTextClassName()}>
                {name.slice(0, 70).trim()}
                {name.length > 70 && "..."}
              </span>
              <TimerContainer />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={layoutClassName}>
      <PageMobileNavigation
        className={"flex items-center justify-between w-fit"}
      >
        <HomeMobileNavigation />
      </PageMobileNavigation>
      <div className={getContainerClassName()}>
        {variant === "chat" ? (
          <>
            <div className="relative flex-1 min-w-0 max-w-[600px] overflow-hidden">
              <input
                type="text"
                ref={inputRef}
                className={getInputClassName()}
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={handleSave}
              />
              <span
                ref={spanRef}
                className="invisible absolute left-0 top-0 whitespace-nowrap pr-1 text-[20px] font-semibold text-primary-900"
              >
                {name}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
              onBlur={handleSave}
            />
            <h2
              ref={spanRef}
              className="invisible absolute min-w-[80%] max-w-[80%] overflow-hidden whitespace-nowrap pr-1 text-[20px] font-semibold text-primary-900"
            >
              {name}
            </h2>
            <TimerContainer />
          </>
        )}
      </div>
    </div>
  );
};

export default EditableHeader;
