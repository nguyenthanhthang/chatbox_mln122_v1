export interface ImageMetadata {
  base64?: string;
  url?: string;
  publicId?: string;
  mimeType?: string;
  filename?: string;
  size?: number;
  width?: number;
  height?: number;
  format?: string;
  tempId?: number; // Client-side only, for upload progress tracking
}
