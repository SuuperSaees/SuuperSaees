import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Spinner } from "@kit/ui/spinner";

import ActiveChats from "~/(main)/orders/[id]/components/files/active-chats";
import ResolvedChat from "~/(main)/orders/[id]/components/files/resolved-chat";
import { Annotation } from "~/lib/annotations.types";
import { AnnotationsCommentsPanelProps } from "../types/types";
import { cn } from "@kit/ui/utils";

const AnnotationsCommentsPanel = ({
  activeTab,
  setActiveTab,
  annotations,
  isLoadingAnnotations,
  handleUpdateAnnotation,
  handleDeleteAnnotation,
  handleChatClick,
  className,
}: AnnotationsCommentsPanelProps) => {
  const renderAnnotationsList = (filteredAnnotations: Annotation.Type[]) => {
    if (filteredAnnotations.length === 0) {
      return (
        <div className="flex items-start gap-5 p-4">
          <div className="h-4 w-4">
            <MessageCircle className="h-4 w-4 text-gray-900" />
          </div>
          <p className="font-inter text-xs font-normal leading-none text-gray-900">
            {t("annotations.chat.noChats")}
          </p>
        </div>
      );
    }

    return filteredAnnotations
      .sort((a, b) => a.created_at?.localeCompare(b.created_at ?? "") ?? 0)
      .map((annotation) => (
        <div key={annotation.id} className="">
          {activeTab === "active" ? (
            <>
              <ActiveChats
                chat={annotation}
                onUpdate={handleUpdateAnnotation}
                onDelete={handleDeleteAnnotation}
                onChatClick={handleChatClick}
                t={t}
              />
            </>
          ) : (
            <>
              <ResolvedChat
                chat={annotation}
                onDelete={handleDeleteAnnotation}
                t={t}
              />
            </>
          )}
        </div>
      ));
  };
  const renderAnnotationsContent = () => {
    if (isLoadingAnnotations) {
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <Spinner className="h-6 w-6" />
        </div>
      );
    }

    const filteredAnnotations = annotations.filter(
      (annotation) =>
        annotation.status === (activeTab === "active" ? "active" : "completed"),
    );

    return (
      <div className="space-y-4">
        {renderAnnotationsList(filteredAnnotations)}
      </div>
    );
  };
  const { t } = useTranslation("orders");
  return (
    <div className={cn("flex min-h-0 w-80 flex-col px-6 shrink-0 h-full", className)}>
      <div className="flex h-10 shrink-0 border-b">
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === "active"
              ? "border-b-2 border-brand text-brand"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("active")}
        >
          {t("annotations.chat.active")} (
          {annotations.filter((a) => a.status === "active").length})
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium ${
            activeTab === "resolved"
              ? "border-b-2 border-brand text-brand"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("resolved")}
        >
          {t("annotations.chat.resolved")} (
          {annotations.filter((a) => a.status === "completed").length})
        </button>
      </div>
      <div className="flex flex-col overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2">
        {renderAnnotationsContent()}
      </div>
    </div>
  );
};

export default AnnotationsCommentsPanel;
