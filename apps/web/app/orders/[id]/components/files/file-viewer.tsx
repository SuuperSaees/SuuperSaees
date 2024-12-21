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
  handleMessageSubmit: (message: string) => void;
  isLoadingMessages: boolean;
  messages: any[];
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
  isCreatingAnnotation, 
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
  messages
}: FileViewerProps) => {
  return (
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
  )
};

export default FileViewer;
