"use client"

import type { ChangeEvent, DragEvent, ReactNode } from "react"
import { CloudUpload } from "lucide-react"
import { useFileUploadDragAndDrop } from "./hooks/use-file-upload-drag-n-drop"

interface DropZoneProps {
  onFilesSelected: (files: FileList | null) => void
  accept?: string
  multiple?: boolean
  children?: ReactNode
  placeholder?: string
  dropHereText?: string
}

export default function FileUploadDropZone({
  onFilesSelected,
  accept,
  multiple = true,
  children,
  placeholder = "Click or drag files to upload",
  dropHereText = "Drop files here",
}: DropZoneProps) {
  const { isDragging, handleDragEnter, handleDragLeave, handleDragOver, handleDrop } = useFileUploadDragAndDrop()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(e.target.files)
  }

  const handleFileDrop = (e: DragEvent<HTMLLabelElement>) => {
    const files = handleDrop(e)
    onFilesSelected(files)
  }

  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed bg-gray-100 p-4 transition-colors hover:bg-gray-50 ${
        isDragging ? "border-primary bg-primary/5" : "border-gray-300"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleFileDrop}
    >
      <input type="file" className="hidden" onChange={handleFileChange} accept={accept} multiple={multiple} />
      <div className="flex h-fit w-fit items-center justify-center rounded-md border border-gray-200 p-3">
        <CloudUpload className="h-5 w-5" />
      </div>
      <p className="text-sm text-gray-500">{isDragging ? dropHereText : placeholder}</p>
      {children}
    </label>
  )
}

