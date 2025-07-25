import { Annotation } from "~/lib/annotations.types";
import { File } from "~/lib/file.types";
import { Message } from "~/lib/message.types";

export interface AnnotationsThumbnailsSidebarProps {
  files: File.Type[];
  selectedFile: File.Type | null;
  setSelectedFile: (file: File.Type) => void;
  setCurrentFileType: (fileType: string) => void;
  resetZoom: () => void;
  setCurrentPage: (page: number) => void;
  className?: string;
}

export interface FileViewerProps {
  currentFileType: string;  
  containerRef: React.RefObject<HTMLDivElement>;
  handleMouseUp: () => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  imageRef: React.RefObject<HTMLDivElement>;
  handleImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  zoomLevel: number;
  position: { x: number; y: number };
  isDragging: boolean;
  selectedFile: File.Type | null;
  currentPage: number;
  totalPages: number;
  setTotalPages: (total: number) => void;
  isLoadingAnnotations: boolean;
  annotations: Annotation.Type[];
  selectedAnnotation: Annotation.Type | null;
  isChatOpen: boolean;
  setIsChatOpen: (isChatOpen: boolean) => void;
  setSelectedAnnotation: (annotation: Annotation.Type | null) => void;
  handleAnnotationClick: (annotation: Annotation.Type) => void;
  handleChatClose: () => void;
  handleMessageSubmit: (message: string, is_first_message: boolean) => Promise<void>;
  isLoadingMessages: boolean;
  messages: Message.Type[];
  handleWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  isSpacePressed: boolean;
  isInitialMessageOpen: boolean;
  setIsInitialMessageOpen: (isInitialMessageOpen: boolean) => void;
  className?: string;
  setCurrentPage: (page: number) => void;
  isMobile?: boolean;
}

export interface AnnotationsCommentsPanelProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  annotations: Annotation.Type[];
  isLoadingAnnotations: boolean;
  handleUpdateAnnotation: (
    annotationId: string,
    status: 'completed' | 'draft' | 'active',
  ) => Promise<void>;
  handleDeleteAnnotation: (annotationId: string) => Promise<void>;
  handleChatClick: (fileId: string, pageNumber: number) => void;
  className?: string;
}