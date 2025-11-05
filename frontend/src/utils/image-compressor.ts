/**
 * Client-side image compression utility
 * Compresses images before upload to reduce file size and improve upload speed
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeMB?: number; // Target max size in MB
  outputFormat?: string; // 'image/jpeg' | 'image/webp' | 'image/png'
}

/**
 * Compress image using Canvas API (browser-native, no dependencies)
 * @param file Original image file
 * @param options Compression options
 * @returns Compressed File blob
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeMB = 1, // Target 1MB
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            // If still too large, reduce quality further
            if (blob.size > maxSizeMB * 1024 * 1024) {
              const reducedQuality = Math.max(0.3, quality * 0.7);
              canvas.toBlob(
                (reducedBlob) => {
                  if (!reducedBlob) {
                    resolve(new File([blob], file.name, { type: outputFormat }));
                    return;
                  }
                  resolve(new File([reducedBlob], file.name, { type: outputFormat }));
                },
                outputFormat,
                reducedQuality
              );
            } else {
              resolve(new File([blob], file.name, { type: outputFormat }));
            }
          },
          outputFormat,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Create base64 preview of image (for instant display)
 * @param file Image file
 * @returns Base64 data URL
 */
export async function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to create preview'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Check if image needs compression
 * @param file Image file
 * @param maxSizeMB Max size in MB before compression
 * @returns true if needs compression
 */
export function needsCompression(file: File, maxSizeMB: number = 1): boolean {
  return file.size > maxSizeMB * 1024 * 1024;
}

