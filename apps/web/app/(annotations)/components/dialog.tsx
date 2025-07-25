'use client';

import { useEffect, useRef } from 'react';
import { useState } from 'react';

import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { ArrowDownToLine, X } from 'lucide-react';
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

import Tooltip from '~/components/ui/tooltip';
import { Annotation } from '~/lib/annotations.types';
import { File } from '~/lib/file.types';
import { useFileHandlers } from '~/(main)/orders/[id]/hooks/files/use-file-handlres';
import { useAnnotations } from '~/(main)/orders/[id]/hooks/use-annotations';
import { handleFileDownload } from '~/(main)/orders/[id]/utils/file-utils';

import AnnotationsHelpTooltip from './help-tooltip';
import AnnotationsContentRenderer from './content-renderer';

export interface AnnotationsProps {
  triggerComponent: React.ReactNode;
  file: File.Type;
  fileName: string;
  files: File.Type[];
}

const AnnotationsDialog = ({
  file,
  triggerComponent,
  fileName,
  files,
}: AnnotationsProps) => {
  const [selectedFile, setSelectedFile] = useState<File.Type | null>(file);
  const [currentFileType, setCurrentFileType] = useState(file.type);
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

  useEffect(()=> {
    setSelectedFile(file);
    setCurrentFileType(file.type); //NWWFSR
    
  }, [file, setSelectedFile, setCurrentFileType])

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

    const cursorHotspotX = 23.5; // px
    const cursorHotspotY = 40; // px (SVG height)

    const x = ((e.clientX - rect.left + cursorHotspotX) / rect.width) * 100;
    const y = ((e.clientY - rect.top - cursorHotspotY) / rect.height) * 100;

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

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent
        className="flex h-[90vh] w-[90vw] max-w-[90vw] flex-col gap-0 p-0 rounded-lg"
        showCloseIcon={false}

      >
        <DialogHeader className="flex flex-row gap-4 text-left justify-between p-4">
          <DialogTitle className='line-clamp-1 leading-normal'>{selectedFile?.name ?? fileName}</DialogTitle>
          <div className="flex gap-4 shrink-0 items-center">
            <Tooltip
              className="w-80 rounded-md bg-white p-2 text-gray-700 shadow-lg"
              content={<AnnotationsHelpTooltip />}
            >
              <QuestionMarkCircledIcon className="h-4 w-4 text-gray-700" />
            </Tooltip>

            <ArrowDownToLine
              className="h-4 w-4 cursor-pointer text-gray-700"
              onClick={() =>
                handleFileDownload(
                  selectedFile?.url ?? '',
                  selectedFile?.name ?? '',
                )
              }
            />
            <DialogClose className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
              <X className="h-4 w-4 text-gray-700" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        <Separator />
        <AnnotationsContentRenderer
          files={files}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          setCurrentFileType={setCurrentFileType}
          resetZoom={resetZoom}
          setCurrentPage={setCurrentPage}
          currentFileType={currentFileType}
          containerRef={containerRef}
          handleMouseUp={handleMouseUp}
          handleMouseMove={handleMouseMove}
          imageRef={imageRef}
          handleImageClick={handleImageClick}
          handleMouseDown={handleMouseDown}
          zoomLevel={zoomLevel}
          position={position}
          isDragging={isDragging}
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
          handleWheel={handleWheel}
          isSpacePressed={isSpacePressed}
          isInitialMessageOpen={isInitialMessageOpen}
          setIsInitialMessageOpen={setIsInitialMessageOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleUpdateAnnotation={handleUpdateAnnotation}
          handleDeleteAnnotation={handleDeleteAnnotation}
          handleChatClick={handleChatClick}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AnnotationsDialog;
