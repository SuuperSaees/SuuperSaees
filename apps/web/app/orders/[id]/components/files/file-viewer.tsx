import { Spinner } from "@kit/ui/spinner";
import { FilePreview } from "./file-preview";
import { Popover, PopoverContent, PopoverTrigger } from "@kit/ui/popover";
import { AnnotationChat, AnnotationMarker } from "./annotation-marker";

interface FileViewerProps {
  currentFileType: string;  
  containerRef: React.RefObject<HTMLDivElement>;
  handleMouseUp: () => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  imageRef: React.RefObject<HTMLDivElement>;
  handleImageClick: () => void;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  zoomLevel: number;
  position: { x: number; y: number };
  isDragging: boolean;
  isCreatingAnnotation: boolean;
  selectedFile: any;
  currentPage: number;
  setTotalPages: (total: number) => void;
  isLoadingAnnotations: boolean;
  annotations: any[];
  selectedAnnotation: any;
  isChatOpen: boolean;
  setIsChatOpen: (isChatOpen: boolean) => void;
  setSelectedAnnotation: (annotation: any) => void;
  handleAnnotationClick: (annotation: any) => void;
  handleChatClose: () => void;
  handleMessageSubmit: (message: string, is_first_message: boolean) => Promise<void>;
  isLoadingMessages: boolean;
  messages: any[];
  handleWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  isSpacePressed: boolean; 
  isInitialMessageOpen: boolean;
  setIsInitialMessageOpen: (isInitialMessageOpen: boolean) => void;
}

const FileViewer = ({ 
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
  selectedFile,
  currentPage,
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
  setIsInitialMessageOpen
}: FileViewerProps) => {
  return (
    <div className={`w-full ${currentFileType.startsWith('image/') ? 'h-full' : 'h-[60vh]'}`}>
    <div
      ref={containerRef}
      className="w-full h-full"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      <div className="w-full h-full bg-gray-100 p-4 overflow-hidden">
        <div
          ref={imageRef}
          onClick={!isSpacePressed ? handleImageClick : undefined}
          onMouseDown={handleMouseDown}
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            cursor: isSpacePressed 
              ? (isDragging ? 'grabbing' : 'grab') 
              : (!currentFileType.startsWith('image/') || isChatOpen 
                  ? 'default' 
                  : 'crosshair'),
            userSelect: 'none',
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
                  {annotations
                    .filter(annotation => 
                      currentFileType.startsWith('application/pdf') 
                        ? annotation.page_number === currentPage 
                        : true
                    )
                    .map((annotation) => (
                      <div 
                        key={annotation.id}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute"
                        style={{ 
                          left: `${annotation.position_x}%`, 
                          top: `${annotation.position_y}%` 
                        }}
                      >
                        <Popover 
                          open={selectedAnnotation?.id === annotation.id && isChatOpen}
                          onOpenChange={(open) => {
                            if (open) {
                              setSelectedAnnotation(annotation);
                            }
                            setIsChatOpen(open);
                            if (!open) {
                              setSelectedAnnotation(null);
                              setIsInitialMessageOpen(false);
                            }
                          }}
                        >
                          <PopoverTrigger asChild>
                            <button 
                              className="bg-transparent border-none p-0 cursor-pointer"
                              onClick={() => {
                                handleAnnotationClick(annotation);
                                setIsChatOpen(!isChatOpen);
                              }}
                            >
                              {
                                selectedFile.id === annotation.file_id && annotation.status === 'active' ? (
                                  <AnnotationMarker
                                    x={0}
                                    y={0}
                                    number={annotation.number}
                                    isActive={selectedAnnotation?.id === annotation.id}
                                    annotation={annotation}
                                  />
                                ) : null
                              }
                            </button>
                          </PopoverTrigger>
                          <PopoverContent 
                            className="w-80" 
                            sideOffset={5}
                            side="right"
                            align="start"
                            isDraggable={true}
                          >
                            <AnnotationChat
                              isOpen={isChatOpen}
                              onClose={handleChatClose}
                              onSubmit={handleMessageSubmit}
                              messages={messages}
                              isLoading={isLoadingMessages}
                              annotation={annotation}
                              isInitialMessageOpen={isInitialMessageOpen}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </div>
  )
};

export default FileViewer;
