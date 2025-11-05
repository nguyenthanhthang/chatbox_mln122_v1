/**
 * File signature (magic numbers) validation utility
 * Validates file type by checking actual file content, not just extension/mime type
 */

// File signatures (magic numbers) for common image formats
const FILE_SIGNATURES: { [key: string]: number[][] } = {
  // JPEG
  'image/jpeg': [
    [0xff, 0xd8, 0xff, 0xe0], // JPEG with JFIF
    [0xff, 0xd8, 0xff, 0xe1], // JPEG with EXIF
    [0xff, 0xd8, 0xff, 0xe2], // JPEG with ICC
    [0xff, 0xd8, 0xff, 0xdb], // JPEG raw
  ],
  // PNG
  'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  // GIF
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  // WebP
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP starts with RIFF)
  ],
  // BMP
  'image/bmp': [[0x42, 0x4d]], // BM
  // TIFF
  'image/tiff': [
    [0x49, 0x49, 0x2a, 0x00], // Little-endian TIFF
    [0x4d, 0x4d, 0x00, 0x2a], // Big-endian TIFF
  ],
  // ICO
  'image/x-icon': [[0x00, 0x00, 0x01, 0x00]],
  // HEIC/HEIF (starts with ftyp box)
  'image/heic': [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]],
  'image/heif': [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]],
};

/**
 * Check if buffer matches a signature pattern
 */
function matchesSignature(buffer: Buffer, signature: number[]): boolean {
  if (buffer.length < signature.length) {
    return false;
  }
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Validate file signature (magic numbers) against mime type
 * @param buffer File buffer
 * @param mimeType Declared mime type
 * @returns true if signature matches mime type, false otherwise
 */
export function validateFileSignature(
  buffer: Buffer,
  mimeType: string,
): boolean {
  // Block SVG - security risk
  if (mimeType === 'image/svg+xml') {
    return false;
  }

  // Get expected signatures for this mime type
  const expectedSignatures = FILE_SIGNATURES[mimeType];
  if (!expectedSignatures) {
    // Unknown mime type - allow if it's an image type (for future formats)
    // But still validate it's actually an image
    return mimeType.startsWith('image/');
  }

  // Check if buffer matches any expected signature
  for (const signature of expectedSignatures) {
    if (matchesSignature(buffer, signature)) {
      // Special handling for WebP (needs RIFF + WEBP check)
      if (mimeType === 'image/webp') {
        // WebP: RIFF header at start, WEBP at offset 8
        if (
          buffer.length >= 12 &&
          buffer[8] === 0x57 &&
          buffer[9] === 0x45 &&
          buffer[10] === 0x42 &&
          buffer[11] === 0x50
        ) {
          return true;
        }
        return false;
      }
      return true;
    }
  }

  // Special case: WebP might be detected as RIFF but we need full validation
  if (mimeType === 'image/webp') {
    return false; // Already checked above
  }

  return false;
}

/**
 * Get file type from signature (useful for detecting actual type)
 */
export function detectFileTypeFromSignature(buffer: Buffer): string | null {
  for (const [mimeType, signatures] of Object.entries(FILE_SIGNATURES)) {
    for (const signature of signatures) {
      if (matchesSignature(buffer, signature)) {
        // Special handling for WebP
        if (mimeType === 'image/webp') {
          if (
            buffer.length >= 12 &&
            buffer[8] === 0x57 &&
            buffer[9] === 0x45 &&
            buffer[10] === 0x42 &&
            buffer[11] === 0x50
          ) {
            return mimeType;
          }
          continue;
        }
        return mimeType;
      }
    }
  }
  return null;
}

