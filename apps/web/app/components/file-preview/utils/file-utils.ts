"use client"

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
}

export const generateFilePath = (fileName: string, fileId: string): string => {
  return `$${fileId}_${sanitizeFileName(fileName)}`
}

export const generateFileId = (): string => {
  return crypto.randomUUID()
}

