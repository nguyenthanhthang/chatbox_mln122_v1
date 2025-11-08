import { apiService } from './api';

export interface CloudinaryUploadSignature {
  signature: string;
  timestamp: number;
  folder: string;
  cloudName: string;
  apiKey: string;
  eager?: string;
  transformation?: string;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  eager?: Array<{
    secure_url: string;
    width: number;
    height: number;
  }>;
}

/**
 * Service để upload trực tiếp lên Cloudinary từ FE
 * Tránh phải upload qua BE → giảm latency & tải server
 */
class CloudinaryUploadService {
  /**
   * Lấy upload signature từ BE
   */
  async getUploadSignature(folder?: string): Promise<CloudinaryUploadSignature> {
    const response = await apiService.post('/chat/upload-signature', {
      folder: folder || 'chatbox/images',
    });
    return response.data;
  }

  /**
   * Upload file trực tiếp lên Cloudinary với signature
   */
  async uploadDirect(
    file: File,
    onProgress?: (progress: number) => void,
    folder?: string,
  ): Promise<CloudinaryUploadResult> {
    // 1. Lấy signature từ BE
    const signatureData = await this.getUploadSignature(folder);

    // 2. Tạo FormData với signature
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signatureData.apiKey);
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('signature', signatureData.signature);
    formData.append('folder', signatureData.folder);

    // Thêm eager transformations nếu có
    if (signatureData.eager) {
      formData.append('eager', signatureData.eager);
    }

    // Thêm transformation nếu có
    if (signatureData.transformation) {
      formData.append('transformation', signatureData.transformation);
    }

    // 3. Upload trực tiếp lên Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded * 100) / e.total);
            onProgress(progress);
          }
        });
      }

      // Success handler
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Không thể parse response từ Cloudinary'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(
              new Error(
                error.error?.message || `Upload thất bại: ${xhr.status}`,
              ),
            );
          } catch {
            reject(new Error(`Upload thất bại: ${xhr.status}`));
          }
        }
      });

      // Error handler
      xhr.addEventListener('error', () => {
        reject(new Error('Lỗi kết nối khi upload lên Cloudinary'));
      });

      // Abort handler
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload bị hủy'));
      });

      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  }

  /**
   * Tạo thumbnail URL từ public_id
   */
  getThumbnailUrl(publicId: string, cloudName: string, width = 320): string {
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${width},c_limit,f_auto,q_auto/${publicId}`;
  }

  /**
   * Tạo optimized URL cho Gemini (max 1024px)
   */
  getOptimizedUrl(publicId: string, cloudName: string): string {
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1024,h_1024,c_limit/${publicId}`;
  }
}

export const cloudinaryUploadService = new CloudinaryUploadService();

