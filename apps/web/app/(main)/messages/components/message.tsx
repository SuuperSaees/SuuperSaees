"use client";

import { useState } from "react";

import { format } from "date-fns";
import { ClockIcon, KeyIcon, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kit/ui/alert-dialog";
import { Button } from "@kit/ui/button";

import { Message as MessageType } from "~/lib/message.types";

import { useChat } from "./context/chat-context";
import UserFile from "./user-file";
import { FileViewerMode } from "~/(main)/hocs/with-file-options";
import { useInView } from "react-intersection-observer";

interface MessageProps {
  message: MessageType.Type & {
    pending?: boolean;
  };
  canDelete?: boolean;
}

export default function Message({
  message,
  canDelete = false,
}: MessageProps) {
  const { deleteMessageMutation, user, fileUploads } = useChat();
  const userRole = user.role;
  const { t } = useTranslation("orders");
  const [isOpen, setIsOpen] = useState(false);

  const date = format(new Date(message.created_at), "MMM dd, p");
  const content = message.content ?? "";

  const displayName = message.user?.name;

  const isInternalMessage =
    ["agency_owner", "agency_member", "agency_project_manager"].includes(
      userRole,
    ) && message.visibility === "internal_agency";

  const handleDeleteMessage = async () => {
    await deleteMessageMutation.mutateAsync({
      messageId: message.id,
      chatId: "",
    });
  };

  // Use intersection observer to detect when message is in view
  const {
    ref: elementRef,
    inView,
    entry,
  } = useInView({
    threshold: 0.1,
    rootMargin: "100px", // Start validation a bit before the element is fully visible
    triggerOnce: true, // Only trigger once for performance
  });

  // Track if the element has ever been in view for validation
  const hasIntersected = inView || entry?.isIntersecting;

  const messageFileUploads = fileUploads.filter((upload) =>
    message.files?.some((file) => file.id === upload.id),
  );

  const getFileUpload = (fileId: string) => {
    const fileUpload = messageFileUploads.find(
      (upload) => upload.id === fileId,
    );
    if (!fileUpload) return undefined;
    return fileUpload;
  };
  
  return (
    <div
      ref={elementRef}
      className="flex w-full min-w-0 max-w-full flex-col gap-2 p-0 group"
    >
      <div className="flex w-full justify-between">
        <div className="flex gap-2">
          <span className="font-semibold">{displayName}</span>
          {message?.pending && (
            <ClockIcon className="h-3 w-3 self-center text-muted-foreground" />
          )}
          {isInternalMessage && (
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <KeyIcon className="w-4 h-4" /> {t("internalMessage")}
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <small>{date}</small>
          {canDelete && (
            <button className="h-4 w-4 group-hover:visible invisible">
              <Trash2
                className="h-4 w-4 cursor-pointer text-gray-600 transition duration-300 hover:text-red-500 "
                onClick={() => setIsOpen(true)}
              />
            </button>
          )}
        </div>
      </div>

      <div className="bg-slate-0 flex w-full flex-col gap-2 overflow-hidden rounded-lg rounded-ss-none leading-relaxed">
        <div
          className={`flex flex-col gap-2 whitespace-normal break-words rounded-lg text-sm ${
            isInternalMessage ? "p-3 bg-yellow-50" : "bg-transparent"
          }`}
        >
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="prose prose-sm max-w-none [&>p]:mb-4 last:[&>p]:mb-0 [&>p]:leading-relaxed"
          />
          {message.files && message.files.length > 0 && (
            <div className="scrollbar-custom flex max-w-full gap-4 overflow-x-auto items-end py-2">
              {message.files.map((file) => (
                <UserFile
                  key={file.id}
                  file={file}
                  files={message.files}
                  viewerMode={FileViewerMode.DEFAULT}
                  upload={getFileUpload(file.id)}
                  enableValidation={hasIntersected}
                />
              ))}
            </div>
          )}
        </div>

        {canDelete && (
          <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="w-[400px]">
              <AlertDialogHeader>
                <div className="flex justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100">
                    <Trash2 className="h-6 w-6 text-error-600" />
                  </div>
                  <X
                    className="h-6 w-6 cursor-pointer text-gray-400"
                    onClick={() => setIsOpen(false)}
                  />
                </div>
              </AlertDialogHeader>
              <AlertDialogTitle>{t("message.deleteMessage")}</AlertDialogTitle>
              <AlertDialogDescription className="font-inter text-[14px] font-normal leading-[20px] text-[#535862]">
                {t("message.deleteMessageDescription")}
              </AlertDialogDescription>
              <AlertDialogFooter>
                <div className="flex w-full justify-between gap-3">
                  <AlertDialogCancel className="font-inter h-11 w-full text-[16px] font-semibold leading-[24px]">
                    {t("message.cancel")}
                  </AlertDialogCancel>
                  <Button
                    variant="destructive"
                    className="font-inter h-11 w-full text-[16px] font-semibold leading-[24px] text-white"
                    onClick={handleDeleteMessage}
                  >
                    {t("message.delete")}
                  </Button>
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
