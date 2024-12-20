import React, { useState, useRef, ComponentType, useEffect } from 'react';
import { Check, Copy, Download, Eye, MoreVertical, ArrowDownToLine, ChevronDown, MessageCircle, Send, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import { Separator } from '@kit/ui/separator';
import { Button } from '@kit/ui/button';
import Tooltip from '~/components/ui/tooltip';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@kit/ui/command';
import { cn } from '@kit/ui/utils';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from 'node_modules/@kit/ui/src/shadcn/pagination';
import { FilePreview } from '../components/files/file-preview';
import { handleCopyLink, handleFileDownload, scales } from '../utils/file-utils';
import { useFileHandlers } from '../hooks/files/use-file-handlres';
import { useTranslation } from 'react-i18next';
import ActiveChats from '../components/files/active-chats';
import ResolvedChat from '../components/files/resolved-chat';
import { AnnotationMarker, AnnotationChat } from '../components/files/annotation-marker';
import { useAnnotations } from '../hooks/use-annotations';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Spinner } from '@kit/ui/spinner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kit/ui/popover"
import { Input } from '@kit/ui/input';

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
  handleDownload: originalHandleDownload,
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
  // const [messages, setMessages] = useState<any[]>([]);

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
    } catch (error) {
      console.error('Error creating annotation:', error);
      setIsCreatingAnnotation(false);
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
      } else {
        console.error('No message_id found for the selected annotation');
      }
    } catch (error) {
      console.error('Error adding message:', error);
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
            <div className='flex items-center justify-between w-full h-10'>
              {
                currentFileType.startsWith('image/') || currentFileType.startsWith('application/pdf') ? (
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-auto justify-between"
                    >
                      {value || "100%"}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandList>
                        <CommandEmpty>No zoom level found.</CommandEmpty>
                        <CommandGroup>
                          {scales.map((scale) => (
                            <CommandItem
                              key={scale.value}
                              value={scale.value}
                              onSelect={handleZoomChange}
                            >
                              {scale.label}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  value === scale.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <div></div>
              )}
              {
                currentFileType.startsWith('image/') ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreatingAnnotation(!isCreatingAnnotation)}
                      className={cn(isCreatingAnnotation && "bg-blue-100")}
                    >
                      {t('annotations.add')}
                    </Button>
                  </div>
                ) : (
                  <div></div>
                )
              }
              <ArrowDownToLine className="w-4 h-4 cursor-pointer text-gray-900" onClick={() => handleFileDownload(selectedFile?.url, selectedFile?.name)} />
            </div>
            <div className={`w-full ${currentFileType.startsWith('image/') ? 'h-full' : 'h-[60vh]'}`}>
              <div
                ref={containerRef}
                className="w-full h-full"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                <div className="w-full h-full bg-gray-100 p-4 overflow-hidden">
                  <div
                    ref={imageRef}
                    onClick={handleImageClick}
                    onMouseDown={currentFileType.startsWith('image/') ? handleMouseDown : undefined}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      transform: currentFileType.startsWith('image/') 
                        ? `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`
                        : 'none',
                      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                      cursor: isCreatingAnnotation 
                        ? 'crosshair'
                        : currentFileType.startsWith('image/') 
                          ? isDragging 
                            ? 'grabbing' 
                            : 'grab'
                          : 'default',
                      userSelect: 'none',
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    {selectedFile && (
                      <>
                        <FilePreview
                          src={selectedFile.url}
                          fileName={selectedFile.name}
                          fileType={selectedFile.type}
                          className="max-w-full max-h-full"
                          isDialog={true}
                          actualPage={currentPage}
                          onLoadPDF={(total) => setTotalPages(total)}
                          zoomLevel={zoomLevel}
                        />
                        { isLoadingAnnotations ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                            <Spinner className="w-6 h-6" />
                          </div>
                        ) : (
                          <>
                            {annotations.map((annotation) => (
                              <Popover key={annotation.id} open={selectedAnnotation?.id === annotation.id && isChatOpen} onOpenChange={(open) => {
                                  setIsChatOpen(open);
                                  if (!open) setSelectedAnnotation(null);
                                }}>
                                <PopoverTrigger asChild>
                                  <button 
                                    className="bg-transparent border-none p-0 cursor-pointer"
                                    onClick={() => handleAnnotationClick(annotation)}
                                  >
                                    <AnnotationMarker
                                      x={annotation.position_x}
                                      y={annotation.position_y}
                                      number={annotation.number}
                                      isActive={selectedAnnotation?.id === annotation.id}
                                    />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                  <AnnotationChat
                                    isOpen={isChatOpen}
                                    onClose={handleChatClose}
                                    onSubmit={handleMessageSubmit}
                                    messages={messages}
                                    isLoading={isLoadingMessages}
                                    annotationName={selectedAnnotation?.message_content ?? ''}
                                  />
                                </PopoverContent>
                              </Popover>
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex items-center justify-center w-full h-10'>
              {
                currentFileType.startsWith('application/pdf') ? (
                  <div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className="cursor-pointer"
                        />
                        
                        {totalPages <= 4 ? (
                          Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <PaginationItem key={pageNum}>
                              <PaginationLink 
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className={cn(
                                  "cursor-pointer",
                                  currentPage === pageNum ? "text-gray-900" : "text-gray-400"
                                )}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          ))
                        ) : (
                          <>
                            {currentPage > 2 && (
                              <>
                                <PaginationItem>
                                  <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              </>
                            )}
                            
                            {Array.from(
                              { length: 3 },
                              (_, i) => Math.max(1, Math.min(currentPage - 1 + i, totalPages))
                            )
                            .filter((pageNum, index, arr) => arr.indexOf(pageNum) === index)
                            .map((pageNum) => (
                              <PaginationItem key={pageNum}>
                                <PaginationLink 
                                  onClick={() => setCurrentPage(pageNum)}
                                  isActive={currentPage === pageNum}
                                  className={cn(
                                    "cursor-pointer",
                                    currentPage === pageNum ? "text-gray-900" : "text-gray-400"
                                  )}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            ))}
                            
                            {currentPage < totalPages - 1 && (
                              <>
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                                    {totalPages}
                                  </PaginationLink>
                                </PaginationItem>
                              </>
                            )}
                          </>
                        )}
                        
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className="cursor-pointer"
                        />
                      </PaginationContent>
                    </Pagination>
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
                    {t('annotations.chat.active')} ({annotations.filter((annotation) => annotation.status === 'active').length})
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium ${
                      activeTab === 'resolved' 
                        ? 'border-b-2 border-brand text-brand' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => setActiveTab('resolved')}
                  >
                    {t('annotations.chat.resolved')} ({annotations.filter((annotation) => annotation.status === 'completed').length})
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {activeTab === 'active' ? (
                    <div className="space-y-4">
                      {
                        isLoadingAnnotations ? (
                          <div className="flex items-center justify-center h-full">
                            <Spinner className="w-6 h-6" />
                          </div>
                        ) : (
                          <div>
                            {annotations.length > 0 && annotations.filter((annotation) => annotation.status === 'active').length > 0 ? (
                              <>
                                {annotations
                                .filter((annotation) => annotation.status === 'active')
                                .map((annotation) => (
                                  <div key={annotation.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group relative">
                                    <ActiveChats chat={annotation} onUpdate={handleUpdateAnnotation} />
                                    <button
                                      onClick={(e) => handleDeleteAnnotation(annotation.id, e)}
                                      className="absolute right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="flex p-4 items-start gap-5 self-stretch">
                                <div className="w-4 h-4">
                                  <MessageCircle className="w-4 h-4 text-gray-900" />
                                </div>
                                <p className="text-gray-900 font-inter text-xs font-normal leading-none">
                                  {t('annotations.chat.noChats')}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      }
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-4">
                      {
                        isLoadingAnnotations ? (
                          <div className="flex items-center justify-center h-full">
                            <Spinner className="w-6 h-6" />
                          </div>
                        ) : (
                          <div>
                            {annotations.length > 0 && annotations.filter((annotation) => annotation.status === 'completed').length > 0 ? (
                              <>
                                {annotations
                                .filter((annotation) => annotation.status === 'completed')
                                .map((annotation) => (
                                  <div key={annotation.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group relative">
                                    <ResolvedChat chat={annotation} />
                                    <button
                                      onClick={(e) => handleDeleteAnnotation(annotation.id, e)}
                                      className="absolute right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <div className="flex p-4 items-start gap-5 self-stretch">
                                <div className="w-4 h-4">
                                  <MessageCircle className="w-4 h-4 text-gray-900" />
                                </div>
                                <p className="text-gray-900 font-inter text-xs font-normal leading-none">
                                  {t('annotations.chat.noChats')}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      }
                    </div>
                    </div>
                  )}
                </div>
              </div>
            ):(
              <div></div>
            )
          }
        </div>
      </DialogContent>
      <AnnotationChat
        isOpen={isChatOpen}
        onClose={handleChatClose}
        onSubmit={handleMessageSubmit}
        messages={messages}
        isLoading={isLoadingMessages}
        annotationName={selectedAnnotation?.message_content ?? ''}
      />
      <Dialog open={isAnnotationNameOpen} onOpenChange={setIsAnnotationNameOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('annotations.chat.title')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAnnotationNameSubmit} className="flex gap-2 p-4">
            <Input
              type="text"
              value={annotationName}
              onChange={(e) => setAnnotationName(e.target.value)}
              placeholder={t('annotations.chat.placeholder')}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <Button type="submit"><Send className="w-4 h-4" /></Button>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

const FileWithOptions = withFileOptions(FilePreview);
export default FileWithOptions;
