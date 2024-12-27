import React, { useState, useRef, ComponentType, useEffect } from 'react';
import { Check, Copy, Download, Eye, MoreVertical, MessageCircle, ArrowDownToLine } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import { Separator } from '@kit/ui/separator';
import Tooltip from '~/components/ui/tooltip';
import { FilePreview } from '../components/files/file-preview';
import { handleCopyLink, handleFileDownload } from '../utils/file-utils';
import { useFileHandlers } from '../hooks/files/use-file-handlres';
import { useTranslation } from 'react-i18next';
import ActiveChats from '../components/files/active-chats';
import ResolvedChat from '../components/files/resolved-chat';
import { useAnnotations } from '../hooks/use-annotations';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Spinner } from '@kit/ui/spinner';
import { FilePagination } from '../components/files/file-pagination';
import { toast } from 'sonner';
import FileViewer from '../components/files/file-viewer';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from 'node_modules/@kit/ui/src/shadcn/hover-card';

interface FileProps {
  src: string;
  fileName: string;
  fileType: string;
  alt?: string;
  className?: string;
  isDialog?: boolean;
  actualPage?: number;
  onLoadPDF?: (total: number) => void;
  zoomLevel?: number;
  files?: File[];
  triggerComponent?: React.ReactNode;
  noPreview?: boolean;
}

export const withFileOptions = <P extends FileProps>(
  WrappedComponent: ComponentType<P>
) => {
  return function WithFileOptions(props: P) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    const handleToggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };

    if (props.noPreview) {
      return (
        <FileDialogView
          triggerComponent={
            <DialogTrigger asChild>
              <button className="text-blue-500 hover:underline">
                {props.fileName}
              </button>
            </DialogTrigger>
          }
          {...props}
        />
      );
    }

    return (
      <div className="group relative inline-block h-full max-h-[150px] w-[150px] min-w-[150px] overflow-hidden justify-center items-center flex border bg-gray-100">
        <FileDialogView
          triggerComponent={
            <>
              <DialogTrigger asChild>
                <div className="cursor-pointer">
                  <WrappedComponent {...props} />
                </div>
              </DialogTrigger>
              <div className="absolute right-0 top-0 flex items-center">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggleMenu();
                  }}
                  className="p-2 text-black sm:hidden"
                >
                  <MoreVertical className="h-6 w-6" />
                </button>

                <div
                  className={`${
                    isMenuOpen ? 'flex' : 'hidden'
                  } absolute right-0 top-8 z-10 flex-col items-start gap-2 rounded-md bg-transparent p-2 text-gray-700 sm:right-0 sm:top-0 sm:flex-row sm:items-center sm:group-hover:flex`}
                >
                  <Tooltip content={'Copy link'}>
                    <button
                      className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCopyLink(props.src, setIsLinkCopied).catch(console.error);
                      }}
                    >
                      {isLinkCopied ? (
                        <Check className="h-[15px] w-[15px] text-green-500" />
                      ) : (
                        <Copy className="h-[15px] w-[15px]" />
                      )}
                    </button>
                  </Tooltip>

                  <Tooltip content="View">
                    <DialogTrigger asChild>
                      <button className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm">
                        <Eye className="h-[15px] w-[15px]" />
                      </button>
                    </DialogTrigger>
                  </Tooltip>

                  <Tooltip content="Download">
                    <button
                      className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleFileDownload(props.src, props.fileName).catch(console.error);
                      }}
                    >
                      <Download className="h-[15px] w-[15px]" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </>
          }
          imageContentComponent={<WrappedComponent {...props} />}
          handleCopyLink={handleCopyLink}
          handleDownload={handleFileDownload}
          isLinkCopied={isLinkCopied}
          fileName={props.fileName}
          fileType={props.fileType}
          files={props.files}
        />
      </div>
    );
  };
};

export const FileDialogView: React.FC<FileProps> = ({
  triggerComponent,
  fileName,
  fileType,
  files,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileType, setCurrentFileType] = useState(fileType);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = React.useState("")
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
    updateAnnotation
  } = useAnnotations({ fileId: selectedFile?.id ?? '', fileName: selectedFile?.name ?? '', isDialogOpen, isInitialMessageOpen });
  
  useEffect(() => {
    if (files?.length) {
      const currentFile = files.find(f => f.name === fileName);
      setSelectedFile(currentFile ?? null);
      setCurrentFileType(currentFile?.type ?? fileType);
      resetZoom();
      setValue("1x");
    }
  }, [files, fileName, fileType]);

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
      const updatedAnnotations = annotations.filter(a => a.content !== '');
      annotations.length = 0;
      annotations.push(...updatedAnnotations);
      
      setSelectedAnnotation(null);
      setIsInitialMessageOpen(false);
    }
  }, [isChatOpen, annotations, setIsInitialMessageOpen, setSelectedAnnotation]);

  useEffect(() => {
    if (isDialogOpen) {
      // Set initial file when dialog opens
      const currentFile = files?.find(f => f.name === fileName);
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
      const selectedElement = container.querySelector(`[data-file-name="${selectedFile.name}"]`);
      
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [selectedFile, isDialogMounted]);

  const handleImageClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCreatingAnnotation || !imageRef.current || !user || isSpacePressed || !currentFileType.startsWith('image/') || isChatOpen) return;

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
        page_number: currentFileType.startsWith('application/pdf') ? currentPage : 1,
        status: 'active' as 'active' | 'completed' | 'draft',
        number: annotations.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

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
        file_id: selectedFile?.id,
        position_x: selectedAnnotation.position_x,
        position_y: selectedAnnotation.position_y,
        content: content,
        user_id: user.id,
        page_number: currentFileType.startsWith('application/pdf') ? currentPage : 1
      });
      setIsChatOpen(false);
      setSelectedAnnotation(annotation);
      setIsInitialMessageOpen(false);
    } else {
      await addMessage({ parent_id: selectedAnnotation.message_id, content, user_id: user.id });
    }
  };

  const handleAnnotationClick = (annotation: any) => {
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

  const handleUpdateAnnotation = async (annotationId: string, status: 'completed' | 'draft' | 'active' ) => {
    if (!selectedFile) return;
    await updateAnnotation({ annotationId, status });
  };

  const handleChatClick = (fileId: string) => {
    const fileToShow = files?.find(f => f.id === fileId);
    if (fileToShow) {
      setSelectedFile(fileToShow);
      setCurrentFileType(fileToShow.type);
      setValue("1x");
      resetZoom();
      setCurrentPage(1);
    }
  };

  const renderAnnotationsList = (filteredAnnotations: any[]) => {
    if (filteredAnnotations.length === 0) {
      return (
        <div className="flex p-4 items-start gap-5">
          <div className="w-4 h-4">
            <MessageCircle className="w-4 h-4 text-gray-900" />
          </div>
          <p className="text-gray-900 font-inter text-xs font-normal leading-none">
            {t('annotations.chat.noChats')}
          </p>
        </div>
      );
    }

    return filteredAnnotations
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((annotation) => (
      <div key={annotation.id} className="">
        {activeTab === 'active' ? (
          <>
            <ActiveChats 
              chat={annotation} 
              onUpdate={handleUpdateAnnotation} 
              onDelete={handleDeleteAnnotation}
              onChatClick={handleChatClick}
            />
            {currentFileType.startsWith('application/pdf') && annotation.page_number && (
              <span className="text-xs text-gray-500">
                {t('annotations.page')} {annotation.page_number}
              </span>
            )}
          </>
        ) : (
          <>
            <ResolvedChat 
              chat={annotation} 
              onDelete={handleDeleteAnnotation}
            />
            {currentFileType.startsWith('application/pdf') && annotation.page_number && (
              <span className="text-xs text-gray-500">
                {t('annotations.page')} {annotation.page_number}
              </span>
            )}
          </>
        )}
      </div>
    ));
  };

  const renderAnnotationsContent = () => {
    if (isLoadingAnnotations) {
      return (
        <div className="flex items-center justify-center h-full">
          <Spinner className="w-6 h-6" />
        </div>
      );
    }

    const filteredAnnotations = annotations.filter(
      (annotation) => annotation.status === (activeTab === 'active' ? 'active' : 'completed')
    );

    return (
      <div className="space-y-4 ">
        {renderAnnotationsList(filteredAnnotations)}
      </div>
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {triggerComponent}
      <DialogContent className="p-0 h-[90vh] w-[90vw] max-w-[90vw] flex flex-col">
        <div className="p-4">
          <DialogHeader>
            <div className="flex justify-between">
              <DialogTitle>{selectedFile?.name ?? fileName}</DialogTitle> 
              <div className="flex">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <QuestionMarkCircledIcon className="w-4 h-4 text-gray-600 mr-4" />
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                  <div>
                    <p className="font-bold">{t('annotations.help.title')}</p>
                    <ul className="list-disc pl-4 text-sm text-gray-700">
                      <li>
                        <strong>{t('annotations.help.move')}</strong> {t('annotations.help.spacebar')}
                      </li>
                      <li>
                        <strong>{t('annotations.help.zoom')}</strong> {t('annotations.help.mouseWheel')}
                      </li>
                    </ul>
                  </div>
                  </HoverCardContent>
                </HoverCard>
                <ArrowDownToLine className="w-4 h-4 cursor-pointer text-gray-600 mr-8" onClick={() => handleFileDownload(selectedFile?.url, selectedFile?.name)} />
              </div>
            </div>
          </DialogHeader>
        </div>
        <Separator />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div 
            ref={filesContainerRef} 
            className="w-52 overflow-y-auto flex flex-col gap-4 items-center"
          >
            {files?.map((file, index) => (
              <div 
                data-file-name={file.name}
                className='flex flex-col cursor-pointer hover:opacity-80' 
                key={index}
                onClick={() => {
                  setSelectedFile(file);
                  setCurrentFileType(file.type);
                  setValue("1x");
                  resetZoom();
                  setCurrentPage(1);
                }}
              >
                <div className={`h-[150px] w-[150px] flex item-center justify-center rounded-lg border ${
                  selectedFile?.name === file.name ? 'border-blue-500 border-2' : 'bg-gray-100'
                }`}>
                  <FilePreview
                    src={file.url}
                    fileName={file.name}
                    fileType={file.type}
                    className="max-w-full max-h-full"
                  />
                </div>
                <p className="text-sm font-medium text-gray-400 truncate w-[150px]">{file.name ?? 'fileName'}</p>
              </div>
            ))}
          </div>

          <div className={`flex flex-col gap-4 items-center ${currentFileType.startsWith('image/') ? 'w-[70%] pl-4' : 'w-[90%] px-4 h-full justify-between'}`}>
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
            />
            <div className='flex items-center justify-center w-full h-10 my-auto'>
              {currentFileType.startsWith('application/pdf') ? (
                <div>
                  <FilePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </div>

          {
            currentFileType.startsWith('image/') ?  (
              <div className="w-80 flex flex-col">
                <div className="flex border-b h-10">
                  <button
                    className={`flex-1 py-2 text-sm font-medium ${
                      activeTab === 'active' 
                        ? 'border-b-2 border-brand text-brand' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('active')}
                  >
                    {t('annotations.chat.active')} ({annotations.filter((a) => a.status === 'active').length})
                  </button>
                  <button
                    className={`flex-1 py-2 text-sm font-medium ${
                      activeTab === 'resolved' 
                        ? 'border-b-2 border-brand text-brand' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('resolved')}
                  >
                    {t('annotations.chat.resolved')} ({annotations.filter((a) => a.status === 'completed').length})
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto w-80">
                  {renderAnnotationsContent()}
                </div>
              </div>
            ):(
              <div></div>
            )
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FileWithOptions = withFileOptions(FilePreview);
export default FileWithOptions;
