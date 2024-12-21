import React, { useState, useRef, ComponentType, useEffect } from 'react';
import { Check, Copy, Download, Eye, MoreVertical, MessageCircle, Trash2 } from 'lucide-react';
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
import AnnotationNameDialog from '../components/files/annotation-name-dialog';
import { FileToolbar } from '../components/files/file-toolbar';
import { toast } from 'sonner';
import FileViewer from '../components/files/file-viewer';

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
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('active');
  const { t } = useTranslation('orders');
  const { user } = useUserWorkspace();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAnnotationNameOpen, setIsAnnotationNameOpen] = useState(false);
  const [annotationName, setAnnotationName] = useState('');
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  const {
    zoomLevel,
    isDragging,
    position,
    handleZoomChange: handleZoomChangeHook,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetZoomAndPosition,
  } = useFileHandlers();


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
  } = useAnnotations(selectedFile?.id ?? '', isDialogOpen);
  
  useEffect(() => {
    if (files?.length) {
      const currentFile = files.find(f => f.name === fileName);
      setSelectedFile(currentFile ?? null);
      setCurrentFileType(currentFile?.type ?? fileType);
      resetZoomAndPosition();
      setValue("1x");
    }
  }, [files, fileName, fileType]);

  const handleZoomChange = (value: string) => {
    handleZoomChangeHook(value);
    setValue(value);
  };

  const handleImageClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCreatingAnnotation || !imageRef.current || !user) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setClickPosition({ x, y });
    setIsAnnotationNameOpen(true);
  };

  const handleAnnotationNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!annotationName.trim() || !clickPosition || !selectedFile || !user) return;

    try {
      createAnnotation({
        file_id: selectedFile.id,
        position_x: clickPosition.x,
        position_y: clickPosition.y,
        content: annotationName,
        user_id: user.id,
        page_number: currentPage
      });

      setIsCreatingAnnotation(false);
      setIsAnnotationNameOpen(false);
      setAnnotationName('');
      setClickPosition(null);
      toast.success(t('annotations.addSuccess'));
    } catch (error) {
      console.error('Error creating annotation:', error);
      setIsCreatingAnnotation(false);
      toast.error(t('annotations.addError'));
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

  const handleMessageSubmit = async (content: string) => {
    if (!selectedAnnotation || !user) return;

    try {
      if (selectedAnnotation.message_id) {
        addMessage({
          parent_id: selectedAnnotation.message_id ,
          content,
          user_id: user.id
        });
        toast.success(t('message.messageSent'));
      } else {
        console.error('No message_id found for the selected annotation');
      }
    } catch (error) {
      console.error('Error adding message:', error);
      toast.error(t('message.messageSentError'));
    }
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    if (!selectedFile) return;
    deleteAnnotation(annotationId);
  };

  const handleUpdateAnnotation = async (annotationId: string, status: 'completed' | 'draft' | 'active' ) => {
    if (!selectedFile) return;
    updateAnnotation({ annotationId, status });
  };

  const renderAnnotationsList = (filteredAnnotations: any[]) => {
    if (filteredAnnotations.length === 0) {
      return (
        <div className="flex p-4 items-start gap-5 self-stretch">
          <div className="w-4 h-4">
            <MessageCircle className="w-4 h-4 text-gray-900" />
          </div>
          <p className="text-gray-900 font-inter text-xs font-normal leading-none">
            {t('annotations.chat.noChats')}
          </p>
        </div>
      );
    }

    return filteredAnnotations.map((annotation) => (
      <div key={annotation.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group relative">
        {activeTab === 'active' ? (
          <ActiveChats chat={annotation} onUpdate={handleUpdateAnnotation} />
        ) : (
          <ResolvedChat chat={annotation} />
        )}
        <button
          onClick={(e) => handleDeleteAnnotation(annotation.id, e)}
          className="absolute right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
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
      <div className="space-y-4">
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
            <DialogTitle>{selectedFile?.name ?? fileName}</DialogTitle>
          </DialogHeader>
        </div>
        <Separator />
        <div className="flex flex-1 gap-4 min-h-0 overflow-hidden px-4 py-0">
          <div className="w-[20%]  overflow-y-auto flex flex-col gap-4 items-center">
            {files?.map((file, index) => (
              <div 
                className='flex flex-col cursor-pointer hover:opacity-80' 
                key={index}
                onClick={() => {
                  setSelectedFile(file);
                  setCurrentFileType(file.type);
                  setValue("1x");
                  resetZoomAndPosition();
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

          <div className={`flex flex-col gap-4 items-center ${currentFileType.startsWith('image/') ? 'w-[50%]' : 'w-[80%]'}`}>
            <FileToolbar
              currentFileType={currentFileType}
              value={value}
              open={open}
              setOpen={setOpen}
              isCreatingAnnotation={isCreatingAnnotation}
              setIsCreatingAnnotation={setIsCreatingAnnotation}
              handleZoomChange={handleZoomChange}
              handleFileDownload={handleFileDownload}
              selectedFile={selectedFile}
              t={t}
            />
            <FileViewer
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
              isCreatingAnnotation={isCreatingAnnotation}
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
              handleMessageSubmit={handleMessageSubmit}
              isLoadingMessages={isLoadingMessages}
              messages={messages}
            />
            <div className='flex items-center justify-center w-full h-10'>
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
            currentFileType.startsWith('image/') ? (
              <div className="w-[30%] flex flex-col">
                <div className="flex border-b h-10">
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium ${
                      activeTab === 'active' 
                        ? 'border-b-2 border-brand text-brand' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('active')}
                  >
                    {t('annotations.chat.active')} ({annotations.filter((a) => a.status === 'active').length})
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium ${
                      activeTab === 'resolved' 
                        ? 'border-b-2 border-brand text-brand' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('resolved')}
                  >
                    {t('annotations.chat.resolved')} ({annotations.filter((a) => a.status === 'completed').length})
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {renderAnnotationsContent()}
                </div>
              </div>
            ):(
              <div></div>
            )
          }
        </div>
      </DialogContent>
      <AnnotationNameDialog
        isOpen={isAnnotationNameOpen}
        onClose={setIsAnnotationNameOpen}
        onSubmit={handleAnnotationNameSubmit}
        annotationName={annotationName}
        setAnnotationName={setAnnotationName}
        t={t}
      />
    </Dialog>
  );
};

const FileWithOptions = withFileOptions(FilePreview);
export default FileWithOptions;
