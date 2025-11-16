import { Spinner } from "@kit/ui/spinner";
import { FilePreview } from "./file-preview";
import { Popover, PopoverContent, PopoverTrigger } from "@kit/ui/popover";
import { AnnotationChat, AnnotationMarker } from "./annotation-marker";
import { FilePagination } from "./file-pagination";
import { FileViewerProps } from "~/(annotations)/types/types";

const markerCursor = `url('data:image/svg+xml,%3Csvg%20width%3D%2247%22%20height%3D%2247%22%20viewBox%3D%220%200%2095%2094%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6.972%2044.7805L6.97193%2044.781C6.6936%2046.9157%205.63255%2057.0438%204.76869%2066.6602C4.336%2071.4769%203.94853%2076.2114%203.73204%2079.7868C3.62437%2081.5649%203.55554%2083.1107%203.54882%2084.2531C3.54555%2084.809%203.55589%2085.3646%203.60053%2085.8354C3.62124%2086.0538%203.66144%2086.3955%203.75887%2086.7584C3.8063%2086.935%203.90191%2087.2509%204.09047%2087.603C4.24016%2087.8825%204.66527%2088.602%205.56295%2089.0833C5.82884%2089.2265%206.04567%2089.3004%206.13051%2089.3288C6.29029%2089.3823%206.42536%2089.4152%206.50738%2089.4337C6.67272%2089.471%206.81973%2089.4933%206.91124%2089.506C7.10448%2089.5329%207.31387%2089.5527%207.50447%2089.5683C7.89857%2089.6005%208.41824%2089.6306%209.02191%2089.6596C10.2393%2089.718%2011.9257%2089.7773%2013.9131%2089.8359C17.8943%2089.9533%2023.1562%2090.07%2028.4532%2090.172C38.8301%2090.3718%2049.5524%2090.5193%2050.9422%2090.4955C73.3617%2090.4745%2090.7194%2070.6745%2090.7194%2046.9982C90.7194%2023.2786%2073.0793%203.5%2050.6704%203.5C39.7777%203.5%2029.6687%207.1608%2021.8444%2014.2605C14.0185%2021.3616%208.67694%2031.7196%206.972%2044.7805Z%22%20fill%3D%22%232F70F1%22%2F%3E%3Cpath%20d%3D%22M6.972%2044.7805L6.97193%2044.781C6.6936%2046.9157%205.63255%2057.0438%204.76869%2066.6602C4.336%2071.4769%203.94853%2076.2114%203.73204%2079.7868C3.62437%2081.5649%203.55554%2083.1107%203.54882%2084.2531C3.54555%2084.809%203.55589%2085.3646%203.60053%2085.8354C3.62124%2086.0538%203.66144%2086.3955%203.75887%2086.7584C3.8063%2086.935%203.90191%2087.2509%204.09047%2087.603C4.24016%2087.8825%204.66527%2088.602%205.56295%2089.0833C5.82884%2089.2265%206.04567%2089.3004%206.13051%2089.3288C6.29029%2089.3823%206.42536%2089.4152%206.50738%2089.4337C6.67272%2089.471%206.81973%2089.4933%206.91124%2089.506C7.10448%2089.5329%207.31387%2089.5527%207.50447%2089.5683C7.89857%2089.6005%208.41824%2089.6306%209.02191%2089.6596C10.2393%2089.718%2011.9257%2089.7773%2013.9131%2089.8359C17.8943%2089.9533%2023.1562%2090.07%2028.4532%2090.172C38.8301%2090.3718%2049.5524%2090.5193%2050.9422%2090.4955C73.3617%2090.4745%2090.7194%2070.6745%2090.7194%2046.9982C90.7194%2023.2786%2073.0793%203.5%2050.6704%203.5C39.7777%203.5%2029.6687%207.1608%2021.8444%2014.2605C14.0185%2021.3616%208.67694%2031.7196%206.972%2044.7805Z%22%20stroke%3D%22white%22%20stroke-width%3D%227%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M6.972%2044.7805L6.97193%2044.781C6.6936%2046.9157%205.63255%2057.0438%204.76869%2066.6602C4.336%2071.4769%203.94853%2076.2114%203.73204%2079.7868C3.62437%2081.5649%203.55554%2083.1107%203.54882%2084.2531C3.54555%2084.809%203.55589%2085.3646%203.60053%2085.8354C3.62124%2086.0538%203.66144%2086.3955%203.75887%2086.7584C3.8063%2086.935%203.90191%2087.2509%204.09047%2087.603C4.24016%2087.8825%204.66527%2088.602%205.56295%2089.0833C5.82884%2089.2265%206.04567%2089.3004%206.13051%2089.3288C6.29029%2089.3823%206.42536%2089.4152%206.50738%2089.4337C6.67272%2089.471%206.81973%2089.4933%206.91124%2089.506C7.10448%2089.5329%207.31387%2089.5527%207.50447%2089.5683C7.89857%2089.6005%208.41824%2089.6306%209.02191%2089.6596C10.2393%2089.718%2011.9257%2089.7773%2013.9131%2089.8359C17.8943%2089.9533%2023.1562%2090.07%2028.4532%2090.172C38.8301%2090.3718%2049.5524%2090.5193%2050.9422%2090.4955C73.3617%2090.4745%2090.7194%2070.6745%2090.7194%2046.9982C90.7194%2023.2786%2073.0793%203.5%2050.6704%203.5C39.7777%203.5%2029.6687%207.1608%2021.8444%2014.2605C14.0185%2021.3616%208.67694%2031.7196%206.972%2044.7805Z%22%20stroke%3D%22black%22%20stroke-opacity%3D%220.01%22%20stroke-width%3D%227%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M46.6783%2061.087C44.8496%2061.087%2043.3671%2059.6046%2043.3671%2057.7758V36.2731C43.3671%2034.4443%2044.8496%2032.9619%2046.6783%2032.9619V32.9619C48.5071%2032.9619%2049.9895%2034.4443%2049.9895%2036.2731V57.7758C49.9895%2059.6046%2048.5071%2061.087%2046.6783%2061.087V61.087ZM35.2742%2050.2149C33.5122%2050.2149%2032.0837%2048.7865%2032.0837%2047.0244V47.0244C32.0837%2045.2624%2033.5122%2043.8339%2035.2742%2043.8339H58.0824C59.8445%2043.8339%2061.2729%2045.2624%2061.2729%2047.0244V47.0244C61.2729%2048.7865%2059.8445%2050.2149%2058.0824%2050.2149H35.2742Z%22%20fill%3D%22white%22%2F%3E%3C%2Fsvg%3E') 0 47, auto`;

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
  className,
  setCurrentPage,
  isMobile = false,
}: FileViewerProps) => {
  return (
    <div className={`flex flex-col items-stretch w-full h-full min-h-0`}>
      <div className={`w-full flex-1 overflow-hidden min-h-0 ${className}`}>
        <div
          ref={containerRef}
          className="w-full h-full"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
        >
          <div className="w-full h-full bg-gray-100 p-4 overflow-hidden items-center justify-center flex relative">
            {/* Contenedor principal que mantiene la escala y posición */}
            <div
              className="relative"
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                transition: isDragging ? "none" : "transform 0.2s ease-out",
              }}
            >
              {/* Contenedor de la imagen */}
              <div
                ref={imageRef}
                onClick={!isSpacePressed ? handleImageClick : undefined}
                onMouseDown={handleMouseDown}
                style={{
                  cursor: isSpacePressed
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : currentFileType.startsWith("video/") || isChatOpen
                      ? "default"
                      : markerCursor,
                  userSelect: "none",
                }}
              >
                {selectedFile && (
                  <FilePreview
                    src={selectedFile.url}
                    fileName={selectedFile.name}
                    fileType={selectedFile.type}
                    className={`${currentFileType.startsWith("application/pdf") && totalPages > 2 ? "h-[65vh]" : "h-[70vh]"}`}
                    isDialog={true}
                    actualPage={currentPage}
                    onLoadPDF={(total) => setTotalPages(total)}
                    zoomLevel={zoomLevel}
                  />
                )}
              </div>

              {/* Capa de anotaciones */}
              {selectedFile && (
                <div className="absolute inset-0 pointer-events-none">
                  {isLoadingAnnotations ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                      <Spinner className="w-6 h-6" />
                    </div>
                  ) : (
                    <>
                      {annotations
                        .filter((annotation) =>
                          currentFileType.startsWith("application/pdf")
                            ? annotation.page_number === currentPage
                            : true,
                        )
                        .map((annotation) => (
                          <div
                            key={annotation.id}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute pointer-events-auto"
                            style={{
                              left: `${annotation.position_x}%`,
                              top: `${annotation.position_y}%`,
                              transform: `scale(${1 / zoomLevel})`,
                              transformOrigin: "0 0",
                            }}
                          >
                            <Popover
                              open={
                                selectedAnnotation?.id === annotation.id &&
                                isChatOpen
                              }
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
                                <button className="bg-transparent border-none p-0 hover:outline-none">
                                  {selectedFile.id === annotation.file_id &&
                                    annotation.status === "active" && (
                                      <AnnotationMarker
                                        x={0}
                                        y={0}
                                        number={annotation.number ?? 0}
                                        isActive={
                                          selectedAnnotation?.id ===
                                          annotation.id
                                        }
                                        annotation={annotation}
                                        onClick={() => {
                                          handleAnnotationClick(annotation);
                                          setIsChatOpen(!isChatOpen);
                                        }}
                                      />
                                    )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-80"
                                sideOffset={isMobile ? 0 : 20}
                                side={
                                  isMobile
                                    ? undefined
                                    : annotation.position_x &&
                                        annotation.position_x > 70
                                      ? "left"
                                      : "right"
                                }
                                align={
                                  isMobile
                                    ? undefined
                                    : annotation.position_y &&
                                        annotation.position_y > 50
                                      ? "end"
                                      : "start"
                                }
                                alignOffset={isMobile ? 0 : 20}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {currentFileType.startsWith("application/pdf") && totalPages > 1 && (
        <div className="flex shrink-0 items-center justify-center py-4">
          <FilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default FileViewer;
