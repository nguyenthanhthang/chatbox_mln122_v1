/**
 * Image metadata interface for chat messages
 * Used for both preview (base64) and uploaded images (Cloudinary)
 */
export interface ImageMetadata {
  url?: string;
  base64?: string | null;
  publicId?: string; // Cloudinary public_id (ưu tiên dùng)
  mimeType: string;
  width?: number;
  height?: number;
  format?: string; // jpg, png, webp, etc.
  filename?: string;
  size?: number; // bytes
}

