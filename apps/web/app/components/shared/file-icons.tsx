import React from 'react';
import { StickyNote, X } from 'lucide-react';
import { FileType } from '../../lib/file-types';
import { cn } from 'node_modules/@kit/ui/src/utils/cn';

// Define the supported file extensions and their corresponding colors
export const FILE_EXTENSION_COLORS: Record<string, string> = {
  // Documents
  pdf: '#D92D20',
  doc: '#155EEF',
  docx: '#155EEF',
  txt: '#535862',
  rtf: '#535862',
  
  // Spreadsheets
  csv: '#079455',
  xls: '#079455',
  xlsx: '#079455',
  
  // Presentations
  ppt: '#E62E05',
  pptx: '#E62E05',
  
  // Design
  fig: '#7F56D9',
  ai: '#E04F16',
  psd: '#155EEF',
  indd: '#BA24D5',
  aep: '#6938EF',
  
  // Development
  html: '#444CE7',
  css: '#444CE7',
  js: '#444CE7',
  jsx: '#444CE7',
  ts: '#444CE7',
  tsx: '#444CE7',
  json: '#444CE7',
  xml: '#444CE7',
  
  // Media - Video
  mp4: '#155EEF',
  mov: '#155EEF',
  avi: '#155EEF',
  mkv: '#155EEF',
  
  // Archives
  zip: '#535862',
  rar: '#535862',
  '7z': '#535862',

  // Images
  heic: '#039855',
  heif: '#039855',
  hevc: '#039855',
  hev: '#039855',

  // Audio
  mp3: '#53B1FD',
  wav: '#53B1FD',
  m4a: '#53B1FD',
  m4b: '#53B1FD',
  m4p: '#53B1FD',
  m4v: '#53B1FD',
  ogg: '#53B1FD',
  wma: '#53B1FD',

  
};

interface FileIconProps {
  extension: string;
  size?: 'sm' | 'md' | 'lg' | 'xs';
  className?: string;
  error?: boolean;
}

export const FileIcon: React.FC<FileIconProps> = ({ 
  extension, 
  size = 'md',
  className = '',
  error = false
}) => {
  const ext = extension.toLowerCase();
  const color = FILE_EXTENSION_COLORS[ext] ?? '#535862';
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xs: 'w-5 h-5'
  };

  if (!ext) {
    return <StickyNote className={cn(`text-gray-500 ${sizeClasses[size]} ${className}`, {
      'text-red-500': error
    })} />;
  }

  const borderColor = '#D5D7DA'; // Keep border gray even on error for better contrast

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M7.75 4C7.75 2.20508 9.20508 0.75 11 0.75H27C27.1212 0.75 27.2375 0.798159 27.3232 0.883885L38.1161 11.6768C38.2018 11.7625 38.25 11.8788 38.25 12V36C38.25 37.7949 36.7949 39.25 35 39.25H11C9.20507 39.25 7.75 37.7949 7.75 36V4Z" 
          stroke={borderColor}
          strokeWidth="1.5"
        />
        <path 
          d="M27 0.5V8C27 10.2091 28.7909 12 31 12H38.5" 
          stroke={borderColor}
          strokeWidth="1.5"
        />
        <rect x="1" y="18" width="27" height="16" rx="2" fill={color} />
        <text
          x="50%"
          y="29"
          textAnchor="middle"
          fill="white"
          fontSize="8"
          fontFamily="system-ui"
          fontWeight="500"
        >
          {ext.toUpperCase()}
        </text>
      </svg>
      {error && (
        <div className="absolute -right-0.5 -top-0.5 z-10 rounded-full bg-red-500  shadow-sm p-0.5">
          <X className="h-2.5 w-2.5 text-white stroke-[2.5]" />
        </div>
      )}
    </div>
  );
};

// Helper function to get file extension from filename
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() ?? '';
};

// Helper function to get icon color based on file type and extension
export const getFileIconColor = (fileType: FileType, extension: string): string => {
  // First try to get color by extension
  if (extension && FILE_EXTENSION_COLORS[extension]) {
    return FILE_EXTENSION_COLORS[extension];
  }

  // Fallback colors based on file type
  const typeColors: Record<FileType, string> = {
    image: '#039855',
    video: '#155EEF',
    audio: '#155EEF',
    pdf: '#D92D20',
    document: '#155EEF',
    spreadsheet: '#079455',
    presentation: '#E62E05',
    other: '#535862'
  };

  return typeColors[fileType];
}; 