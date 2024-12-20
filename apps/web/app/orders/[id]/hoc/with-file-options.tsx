import React, { useState, useRef, ComponentType, useEffect } from 'react';
import { Check, Copy, Download, Eye, MoreVertical, ArrowDownToLine, ChevronDown, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@kit/ui/dialog';
import { Separator } from '@kit/ui/separator';
import { Button } from '@kit/ui/button';
import Tooltip from '~/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@kit/ui/command';
import { cn } from '@kit/ui/utils';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from 'node_modules/@kit/ui/src/shadcn/pagination';
import { FilePreview } from '../components/files/file-preview';
import { handleCopyLink, handleFileDownload, scales } from '../utils/file-utils';
import { useFileHandlers } from '../hooks/files/use-file-handlres';
import { useTranslation } from 'react-i18next';
import ActiveChats from '../components/files/active-chats';
import ResolvedChat from '../components/files/resolved-chat';

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
  const [activeChats, setActiveChats] = useState([]);
  const [resolvedChats, setResolvedChats] = useState([]);
  const { t } = useTranslation('orders');

  const {
    zoomLevel,
    isDragging,
    position,
    handleImageClick,
    handleDialogDownload,
    handleZoomChange: handleZoomChangeHook,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetZoomAndPosition,
  } = useFileHandlers();
  
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

  return (
    <Dialog>
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

          <div className="w-[50%] flex flex-col gap-4 items-center">
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
                    onClick={currentFileType.startsWith('image/') ? handleImageClick : undefined}
                    onMouseDown={currentFileType.startsWith('image/') ? handleMouseDown : undefined}
                    onDragStart={(e) => e.preventDefault()}
                    style={{
                      transform: currentFileType.startsWith('image/') 
                        ? `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`
                        : 'none',
                      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                      cursor: currentFileType.startsWith('image/') 
                        ? zoomLevel === 1 
                          ? 'zoom-in'
                          : isDragging 
                            ? 'grabbing' 
                            : 'grab'
                        : 'default',
                      userSelect: 'none',
                      height: '100%',
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {selectedFile && (
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
                {t('filesView.active')}
              </button>
              <button
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'resolved' 
                    ? 'border-b-2 border-brand text-brand' 
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab('resolved')}
              >
                {t('filesView.resolved')}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'active' ? (
                <div className="space-y-4">
                  {activeChats.length > 0 ? (
                    <>
                      {activeChats.map((chat) => (
                        <div key={chat.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                          <ActiveChats chat={chat} />
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-start h-full justify-start gap-4 text-center">
                      <MessageCircle className="w-10 h-10 text-gray-900" />
                      <p className="text-sm text-gray-900 text-start">
                        {t('filesView.noActiveChats')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-4">
                  {resolvedChats.length > 0 ? (
                    <>
                      {resolvedChats.map((chat) => (
                        <div key={chat.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                          <ResolvedChat chat={chat} />
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-start h-full justify-start gap-4 text-center">
                      <MessageCircle className="w-10 h-10 text-gray-900" />
                      <p className="text-sm text-gray-900 text-start">
                        {t('filesView.noActiveChats')}
                      </p>
                    </div>
                  )}
                </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const FileWithOptions = withFileOptions(FilePreview);
export default FileWithOptions;
