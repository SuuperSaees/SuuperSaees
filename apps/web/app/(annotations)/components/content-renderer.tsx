"use client";

import { useIsMobile } from "~/hooks/useIsMobile";
import AnnotationsThumbnailsSidebar from "./thumbnails-sidebar";
import AnnotationsCommentsPanel from "./comments-panel";
import FileViewer from "~/(main)/orders/[id]/components/files/file-viewer";
import {
  AnnotationsCommentsPanelProps,
  AnnotationsThumbnailsSidebarProps,
  FileViewerProps,
} from "../types/types";
import { cn } from "@kit/ui/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kit/ui/tabs";
import { FileIcon, MessageCircle, Pen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { File } from "~/lib/file.types";

interface ContentRendererProps
  extends AnnotationsThumbnailsSidebarProps,
    FileViewerProps,
    AnnotationsCommentsPanelProps {
  className?: string;
}
const AnnotationsContentRenderer = ({
  files,
  selectedFile,
  setSelectedFile,
  setCurrentFileType,
  resetZoom,
  setCurrentPage,
  currentFileType,
  containerRef,
  handleMouseUp,
  handleMouseMove,
  imageRef,
  handleImageClick,
  handleMouseDown,
  zoomLevel,
  position,
  isDragging,
  currentPage,
  totalPages,
  setTotalPages,
  isLoadingAnnotations,
  annotations,
  selectedAnnotation,
  isChatOpen,
  setIsChatOpen,
  setSelectedAnnotation,
  handleAnnotationClick,
  handleChatClose,
  handleMessageSubmit,
  isLoadingMessages,
  messages,
  handleWheel,
  isSpacePressed,
  isInitialMessageOpen,
  setIsInitialMessageOpen,
  activeTab,
  setActiveTab,
  handleUpdateAnnotation,
  handleDeleteAnnotation,
  handleChatClick,
  className,
}: ContentRendererProps) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation("annotations");
  const [selectedTabMobile, setSelectedTabMobile] = useState("annotations");

  if (!isMobile) {
    return (
      <div className={cn("flex min-h-0 flex-1", className)}>
        <AnnotationsThumbnailsSidebar
          files={files}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          setCurrentFileType={setCurrentFileType}
          resetZoom={resetZoom}
          setCurrentPage={setCurrentPage}
        />

        <FileViewer
          currentFileType={currentFileType}
          containerRef={containerRef}
          handleMouseUp={handleMouseUp}
          handleMouseMove={handleMouseMove}
          handleWheel={handleWheel}
          imageRef={imageRef}
          handleImageClick={handleImageClick}
          handleMouseDown={handleMouseDown}
          zoomLevel={zoomLevel}
          position={position}
          isDragging={isDragging}
          selectedFile={selectedFile}
          currentPage={currentPage}
          totalPages={totalPages}
          setTotalPages={setTotalPages}
          isLoadingAnnotations={isLoadingAnnotations}
          annotations={annotations}
          selectedAnnotation={selectedAnnotation}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          setSelectedAnnotation={setSelectedAnnotation}
          handleAnnotationClick={handleAnnotationClick}
          handleChatClose={handleChatClose}
          handleMessageSubmit={handleMessageSubmit}
          isLoadingMessages={isLoadingMessages}
          messages={messages}
          isSpacePressed={isSpacePressed}
          isInitialMessageOpen={isInitialMessageOpen}
          setIsInitialMessageOpen={setIsInitialMessageOpen}
          setCurrentPage={setCurrentPage}
          isMobile={isMobile}
        />
        {!currentFileType.startsWith("video/") && (
          <AnnotationsCommentsPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            annotations={annotations}
            isLoadingAnnotations={isLoadingAnnotations}
            handleUpdateAnnotation={handleUpdateAnnotation}
            handleDeleteAnnotation={handleDeleteAnnotation}
            handleChatClick={handleChatClick}
          />
        )}
      </div>
    );
  } else {
    const setSelectedFileMobile = (file: File.Type) => {
      setSelectedTabMobile("annotations");
      setSelectedFile(file);
    };

    return (
      <div className={cn("flex min-h-0 flex-col h-full", className)}>
        <Tabs
          defaultValue={selectedTabMobile}
          value={selectedTabMobile} 
          onValueChange={(value) => setSelectedTabMobile(value)}
          className="flex flex-col h-full min-h-0"
        >
          <TabsList className="w-full flex shrink-0">
            <TabsTrigger
              value="annotations"
              className="flex items-center gap-2 flex-1"
            >
              <Pen className="h-4 w-4 text-gray-900 dark:text-gray-50" />
              <span className="text-sm font-medium">{t("title")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center gap-2 flex-1"
            >
              <MessageCircle className="h-4 w-4 text-gray-900 dark:text-gray-50" />
              <span className="text-sm font-medium">{t("chat.title")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="flex items-center gap-2 flex-1"
            >
              <FileIcon className="h-4 w-4 text-gray-900 dark:text-gray-50" />
              <span className="text-sm font-medium">{t("files.title")}</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="files" className="flex-1 min-h-0 overflow-y-auto">
            <AnnotationsThumbnailsSidebar
              files={files}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFileMobile}
              setCurrentFileType={setCurrentFileType}
              resetZoom={resetZoom}
              setCurrentPage={setCurrentPage}
              className="mx-auto"
            />
          </TabsContent>
          <TabsContent value="chat" className="flex-1 min-h-0 overflow-y-auto">
            <AnnotationsCommentsPanel
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              annotations={annotations}
              isLoadingAnnotations={isLoadingAnnotations}
              handleUpdateAnnotation={handleUpdateAnnotation}
              handleDeleteAnnotation={handleDeleteAnnotation}
              handleChatClick={handleChatClick}
              className="w-full"
            />
          </TabsContent>
          <TabsContent value="annotations" className="flex-1 min-h-0 overflow-hidden">
            <FileViewer
              currentFileType={currentFileType}
              containerRef={containerRef}
              handleMouseUp={handleMouseUp}
              handleMouseMove={handleMouseMove}
              handleWheel={handleWheel}
              imageRef={imageRef}
              handleImageClick={handleImageClick}
              handleMouseDown={handleMouseDown}
              zoomLevel={zoomLevel}
              position={position}
              isDragging={isDragging}
              selectedFile={selectedFile}
              currentPage={currentPage}
              totalPages={totalPages}
              setTotalPages={setTotalPages}
              isLoadingAnnotations={isLoadingAnnotations}
              annotations={annotations}
              selectedAnnotation={selectedAnnotation}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
              setSelectedAnnotation={setSelectedAnnotation}
              handleAnnotationClick={handleAnnotationClick}
              handleChatClose={handleChatClose}
              handleMessageSubmit={handleMessageSubmit}
              isLoadingMessages={isLoadingMessages}
              messages={messages}
              isSpacePressed={isSpacePressed}
              isInitialMessageOpen={isInitialMessageOpen}
              setIsInitialMessageOpen={setIsInitialMessageOpen}
              setCurrentPage={setCurrentPage}
              isMobile={isMobile}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
};

export default AnnotationsContentRenderer;
