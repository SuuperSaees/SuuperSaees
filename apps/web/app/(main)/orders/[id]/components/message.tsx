import { format } from "date-fns";
// import { Message } from "~/lib/message.types";
import { useActivityContext } from "../context/activity-context";
import { ClockIcon, KeyIcon, Trash, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@kit/ui/alert-dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@kit/ui/button";
import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
import UserFile from "~/(main)/orders/[id]/components/user-file";
import { FileViewerMode } from "../../../hocs/with-file-options";
import { DataResult } from "../context/activity.types";
import { useInView } from 'react-intersection-observer';

interface ChatMessageProps {
  message: DataResult.Message;
  isHovered: boolean;
}

const ChatMessage = ({ message, isHovered }: ChatMessageProps) => {
  const { userRole, deleteMessage, allFiles, fileUploads } =
    useActivityContext();
  const { user: currentUser } = useUserWorkspace();
  const { t } = useTranslation("orders");
  const [isOpen, setIsOpen] = useState(false);

  // Use intersection observer to detect when message is in view
  const { ref: elementRef, inView, entry } = useInView({
    threshold: 0.1,
    rootMargin: '100px', // Start validation a bit before the element is fully visible
    triggerOnce: true, // Only trigger once for performance
  });

  // Track if the element has ever been in view for validation
  const hasIntersected = inView || entry?.isIntersecting;

  const date = format(new Date(message.created_at), "MMM dd, p");
  const content = message.content ?? "";

  const isClientGuest =
    message.user?.name?.toLowerCase().includes("guest") &&
    message.user?.email?.toLowerCase().includes("guest") &&
    message.user?.email?.toLowerCase().includes("@suuper.co");

  const displayName = isClientGuest
    ? `${t("guest")} ${message.user?.settings?.[0]?.name?.split(" ")[1] ?? message.user?.name?.split(" ")[1]}`
    : (message.user?.settings?.[0]?.name ?? message.user?.name);

  const agencyRoles = new Set([
    "agency_owner",
    "agency_member",
    "agency_project_manager",
  ]);

  const isInternalMessage =
    agencyRoles.has(userRole) && message.visibility === "internal_agency";

  const handleDeleteMessage = async () => {
    await deleteMessage.mutateAsync({
      messageId: message.id,
      adminActived: userRole === "agency_owner",
    });
    setIsOpen(false);
  };

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
    <div ref={elementRef} className="flex flex-col gap-2 w-full p-0 max-w-full min-w-0">
      <div className="flex justify-between w-full">
        <div className="flex gap-2">
          <span className="font-semibold text-sm">{displayName}</span>
          {message?.pending && (
            <ClockIcon className="h-3 w-3 text-muted-foreground self-center" />
          )}
          {isInternalMessage && (
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <KeyIcon className="w-4 h-4" /> {t("internalMessage")}
            </span>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <small className="shrink-0">{date}</small>
          <div className="w-4 h-4">
            {isHovered &&
              (currentUser?.id === message.user_id ||
                userRole === "agency_owner") && (
                <Trash
                  className="w-4 h-4 hover:text-red-500 transition duration-300 cursor-pointer text-gray-600"
                  onClick={() => setIsOpen(true)}
                />
              )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg rounded-ss-none w-full bg-slate-0 overflow-visible leading-relaxed">
        <div
          className={`flex flex-col gap-2 text-sm break-words rounded-lg whitespace-normal ${
            isInternalMessage ? "p-3 bg-yellow-50" : "bg-transparent"
          }`}
        >
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="prose prose-sm max-w-none [&>p]:mb-4 last:[&>p]:mb-0 [&>p]:leading-relaxed"
          />
          {message.files && message.files.length > 0 && (
            <div className="flex max-w-full gap-4 overflow-x-auto scrollbar-custom py-2 pr-2">
              {message.files.map((file) => (
                <UserFile
                  key={file.id}
                  file={file}
                  files={allFiles}
                  viewerMode={FileViewerMode.ANNOTATIONS}
                  upload={getFileUpload(file.id)}
                  enableValidation={hasIntersected}
                  // onRemove={handleRemoveFile}
                />
              ))}
            </div>
          )}
        </div>

        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogContent className="w-[400px]">
            <AlertDialogHeader>
              <div className="flex justify-between">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error-100">
                  <Trash className="w-6 h-6 text-error-600" />
                </div>
                <X
                  className="w-6 h-6 cursor-pointer text-gray-400"
                  onClick={() => setIsOpen(false)}
                />
              </div>
            </AlertDialogHeader>
            <AlertDialogTitle>{t("message.deleteMessage")}</AlertDialogTitle>
            <AlertDialogDescription className="text-[#535862] font-inter text-[14px] font-normal leading-[20px]">
              {t("message.deleteMessageDescription")}
            </AlertDialogDescription>
            <AlertDialogFooter>
              <div className="flex justify-between w-full gap-3">
                <AlertDialogCancel className="w-full h-11 font-inter text-[16px] font-semibold leading-[24px]">
                  {t("message.cancel")}
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  className="w-full h-11 text-white font-inter text-[16px] font-semibold leading-[24px]"
                  onClick={handleDeleteMessage}
                >
                  {t("message.delete")}
                </Button>
              </div>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ChatMessage;
