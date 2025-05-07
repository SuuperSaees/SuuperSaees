'use client';

import { useEffect, useRef } from 'react';
import { useState } from 'react';

import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { ArrowDownToLine, MessageCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Separator } from '@kit/ui/separator';
import { Spinner } from '@kit/ui/spinner';

import Tooltip from '~/components/ui/tooltip';
import { Annotation } from '~/lib/annotations.types';
import { File } from '~/lib/file.types';
import ActiveChats from '~/orders/[id]/components/files/active-chats';
import FileViewer from '~/orders/[id]/components/files/file-viewer';
import ResolvedChat from '~/orders/[id]/components/files/resolved-chat';
import { useFileHandlers } from '~/orders/[id]/hooks/files/use-file-handlres';
import { useAnnotations } from '~/orders/[id]/hooks/use-annotations';
import { handleFileDownload } from '~/orders/[id]/utils/file-utils';

import AnnotationsHelpTooltip from './help-tooltip';
import AnnotationsThumbnailsSidebar from './thumbnails-sidebar';
import AnnotationsCommentsPanel from './comments-panel';

export interface AnnotationsProps {
  triggerComponent: React.ReactNode;
  fileName: string;
  fileType: string;
  files: File.Type[];
}

const AnnotationsDialog = ({
  triggerComponent,
  fileName,
  fileType,
  files,
}: AnnotationsProps) => {
  const [selectedFile, setSelectedFile] = useState<File.Type | null>(null);
  const [currentFileType, setCurrentFileType] = useState(fileType);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('active');
  const { t } = useTranslation('orders');
  const { user } = useUserWorkspace();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isInitialMessageOpen, setIsInitialMessageOpen] = useState(false);
  const filesContainerRef = useRef<HTMLDivElement>(null);
  const [isDialogMounted, setIsDialogMounted] = useState(false);
  const {
    zoomLevel,
    isDragging,
    position,
    handleWheel,
    isSpacePressed,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetZoom,
  } = useFileHandlers(1, currentFileType);

  const otherFileIds = files
    ?.filter((file) => file.id !== selectedFile?.id)
    .map((file) => file.id);
  const {
    annotations,
    isLoadingAnnotations,
    messages,
    isLoadingMessages,
    createAnnotation,
    addMessage,
    isCreatingAnnotation,
    setIsCreatingAnnotation,
    selectedAnnotation,
    setSelectedAnnotation,
    deleteAnnotation,
    updateAnnotation,
  } = useAnnotations({
    fileId: selectedFile?.id ?? '',
    fileName: selectedFile?.name ?? '',
    isDialogOpen,
    isInitialMessageOpen,
    otherFileIds,
  });

  useEffect(() => {
    if (files?.length) {
      const currentFile = files.find((f) => f.name === fileName);
      setSelectedFile(currentFile ?? null);
      setCurrentFileType(currentFile?.type ?? fileType);
      resetZoom();
    }
  }, [files, fileName, fileType, resetZoom]);

  useEffect(() => {
    if (isLoadingAnnotations) {
      setIsCreatingAnnotation(false);
    } else {
      setIsCreatingAnnotation(true);
    }
  }, [isCreatingAnnotation, isLoadingAnnotations, setIsCreatingAnnotation]);

  useEffect(() => {
    if (!isChatOpen) {
      // Remove all annotations with empty content
      const updatedAnnotations = annotations.filter((a) => a.content !== '');
      annotations.length = 0;
      annotations.push(...updatedAnnotations);

      setSelectedAnnotation(null);
      setIsInitialMessageOpen(false);
    }
  }, [isChatOpen, annotations, setIsInitialMessageOpen, setSelectedAnnotation]);

  useEffect(() => {
    if (isDialogOpen) {
      // Set initial file when dialog opens
      const currentFile = files?.find((f) => f.name === fileName);
      setSelectedFile(currentFile ?? null);
      setCurrentFileType(currentFile?.type ?? fileType);

      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsDialogMounted(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setIsDialogMounted(false);
    }
  }, [isDialogOpen, files, fileName, fileType]);

  useEffect(() => {
    if (selectedFile && filesContainerRef.current && isDialogMounted) {
      const container = filesContainerRef.current;
      const selectedElement = container.querySelector(
        `[data-file-name="${selectedFile.name}"]`,
      );

      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [selectedFile, isDialogMounted]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      !isCreatingAnnotation ||
      !imageRef.current ||
      !user ||
      isSpacePressed ||
      currentFileType.startsWith('video/') ||
      isChatOpen
    )
      return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    try {
      const annotation = {
        id: crypto.randomUUID(),
        file_id: selectedFile?.id ?? '',
        position_x: x,
        position_y: y,
        content: '',
        user_id: user.id,
        page_number: currentFileType.startsWith('application/pdf')
          ? currentPage
          : 0,
        status: 'active' as 'active' | 'completed' | 'draft',
        number: annotations.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_on: null,
        message_id: null,
      };

      setIsInitialMessageOpen(true);
      setSelectedAnnotation(annotation);
      annotations.push(annotation);
      setIsChatOpen(true);
    } catch (error) {
      console.error('Error creating annotation:', error);
      toast.error(t('annotations.addError'));
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedAnnotation || !user) return;
    if (isInitialMessageOpen) {
      const annotation = await createAnnotation({
        file_id: selectedFile?.id ?? '',
        position_x: selectedAnnotation.position_x ?? 0,
        position_y: selectedAnnotation.position_y ?? 0,
        content: content,
        user_id: user.id,
        page_number: currentFileType.startsWith('application/pdf')
          ? currentPage
          : 0,
      });
      setIsChatOpen(false);
      setSelectedAnnotation(annotation);
      setIsInitialMessageOpen(false);
    } else {
      await addMessage({
        parent_id: selectedAnnotation.message_id ?? '',
        content,
        user_id: user.id,
      });
    }
  };

  const handleAnnotationClick = (annotation: Annotation.Type) => {
    setSelectedAnnotation(annotation);
    setIsChatOpen(true);
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setSelectedAnnotation(null);
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (!selectedFile) return;
    await deleteAnnotation(annotationId);
  };

  const handleUpdateAnnotation = async (
    annotationId: string,
    status: 'completed' | 'draft' | 'active',
  ) => {
    if (!selectedFile) return;
    await updateAnnotation({ annotationId, status });
  };

  const handleChatClick = (fileId: string, pageNumber?: number) => {
    const fileToShow = files?.find((f) => f.id === fileId);
    if (fileToShow) {
      setSelectedFile(fileToShow);
      setCurrentFileType(fileToShow.type);
      resetZoom();
      if (pageNumber && fileToShow.type.startsWith('application/pdf')) {
        setCurrentPage(pageNumber);
      } else {
        setCurrentPage(1);
      }
    }
  };

  const renderAnnotationsList = (filteredAnnotations: Annotation.Type[]) => {
    if (filteredAnnotations.length === 0) {
      return (
        <div className="flex items-start gap-5 p-4">
          <div className="h-4 w-4">
            <MessageCircle className="h-4 w-4 text-gray-900" />
          </div>
          <p className="font-inter text-xs font-normal leading-none text-gray-900">
            {t('annotations.chat.noChats')}
          </p>
        </div>
      );
    }

    return filteredAnnotations
      .sort((a, b) => a.created_at?.localeCompare(b.created_at ?? '') ?? 0)
      .map((annotation) => (
        <div key={annotation.id} className="">
          {activeTab === 'active' ? (
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
        <div className="flex h-full w-full items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      );
    }

    const filteredAnnotations = annotations.filter(
      (annotation) =>
        annotation.status === (activeTab === 'active' ? 'active' : 'completed'),
    );

    return (
      <div className="space-y-4">
        {renderAnnotationsList(filteredAnnotations)}
      </div>
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent
        className="flex h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 p-0"
        showCloseIcon={false}
      >
        <DialogHeader className="flex flex-row justify-between p-4">
          <DialogTitle>{selectedFile?.name ?? fileName}</DialogTitle>
          <div className="flex">
            <Tooltip
              className="w-80 rounded-md bg-white p-2 text-gray-700 shadow-lg"
              content={<AnnotationsHelpTooltip />}
            >
              <QuestionMarkCircledIcon className="mr-[34px] h-6 w-6 text-[#A4A7AE]" />
            </Tooltip>

            <ArrowDownToLine
              className="mr-[34px] h-6 w-6 cursor-pointer text-[#A4A7AE]"
              onClick={() =>
                handleFileDownload(
                  selectedFile?.url ?? '',
                  selectedFile?.name ?? '',
                )
              }
            />
            <DialogClose className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
              <X className="h-6 w-6 text-[#A4A7AE]" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <Separator />
        <div className="flex min-h-0 flex-1">
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
            handleMessageSubmit={handleSendMessage}
            isLoadingMessages={isLoadingMessages}
            messages={messages}
            isSpacePressed={isSpacePressed}
            isInitialMessageOpen={isInitialMessageOpen}
            setIsInitialMessageOpen={setIsInitialMessageOpen}
            setCurrentPage={setCurrentPage}
          />

          <AnnotationsCommentsPanel
            currentFileType={currentFileType}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            annotations={annotations}
            renderAnnotationsContent={renderAnnotationsContent}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnotationsDialog;
