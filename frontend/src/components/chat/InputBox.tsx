import React, { useState, useRef, KeyboardEvent } from "react";
import { toastError, toastWarn, toastSuccess } from "../../utils/toast";
import {
  compressImage,
  createImagePreview,
  needsCompression,
} from "../../utils/image-compressor";
import { chatService } from "../../services/chat.service";
import { ImageMetadata } from "../../types/image.types";

interface InputBoxProps {
  onSendMessage: (message: string, images?: ImageMetadata[]) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Nhập câu hỏi của bạn...",
  autoFocus = false,
}) => {
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: number]: number;
  }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileIndexRef = useRef(0);

  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async () => {
    if ((!message.trim() && images.length === 0) || disabled) return;

    const messageToSend = message.trim();
    const imagesToSend = [...images];

    setMessage("");
    setImages([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await onSendMessage(
      messageToSend,
      imagesToSend.length > 0 ? imagesToSend : undefined
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Giới hạn số ảnh (4 ảnh/lần) để UI gọn và tránh spam băng thông
    const MAX_IMAGES = 4;
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      toastWarn(
        `Chỉ có thể tải tối đa ${MAX_IMAGES} ảnh. Vui lòng xóa một số ảnh trước khi thêm mới.`
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toastWarn(
        `Chỉ có thể thêm tối đa ${remainingSlots} ảnh nữa. ${
          files.length - remainingSlots
        } ảnh đã bị bỏ qua.`
      );
    }

    setIsUploading(true);
    try {
      // Process all files in parallel for better performance
      const uploadPromises = filesToProcess.map(async (file) => {
        // Kiểm tra kích thước file
        if (file.size > 5 * 1024 * 1024) {
          toastWarn("File phải nhỏ hơn 5MB");
          return null;
        }

        // Kiểm tra định dạng file - chấp nhận mọi file ảnh (trừ SVG)
        if (!file.type.startsWith("image/")) {
          toastWarn("Chỉ chấp nhận file ảnh");
          return null;
        }

        // Block SVG files vì security risk
        if (file.type === "image/svg+xml") {
          toastWarn(
            "SVG files không được hỗ trợ. Vui lòng sử dụng PNG, JPG hoặc WebP."
          );
          return null;
        }

        let preview: string | null = null;

        try {
          const currentIndex = fileIndexRef.current++;

          // Tối ưu: Hiển thị preview ngay lập tức (base64) - không cần đợi upload
          preview = await createImagePreview(file);

          // Chỉ set base64 khi preview không null (type-safe)
          // Gắn tempId để track progress riêng cho từng ảnh
          const newImage: ImageMetadata = {
            mimeType: file.type,
            tempId: currentIndex, // Thêm tempId để track progress
          };

          // Chỉ thêm base64 nếu preview không null
          if (preview) {
            newImage.base64 = preview;
          }

          setImages((prev) => [...prev, newImage]);

          // Client-side compression trước khi upload (nếu file > 1MB)
          // Tối ưu: giảm xuống 1280px để upload nhanh hơn (theo yêu cầu)
          let fileToUpload = file;
          if (needsCompression(file, 1)) {
            try {
              fileToUpload = await compressImage(file, {
                maxWidth: 1280, // Giảm từ 1920 xuống 1280px (theo yêu cầu)
                maxHeight: 1280,
                quality: 0.8,
                maxSizeMB: 1,
                outputFormat: "image/jpeg", // JPEG nhỏ hơn PNG
              });
            } catch (compressError) {
              console.warn(
                "Compression failed, using original file:",
                compressError
              );
              // Continue with original file if compression fails
            }
          }

          setUploadProgress((prev) => ({ ...prev, [currentIndex]: 0 }));

          // Upload compressed file (nhỏ hơn → upload nhanh hơn)
          const uploaded = await chatService.uploadImage(
            fileToUpload,
            (progress) => {
              setUploadProgress((prev) => ({
                ...prev,
                [currentIndex]: progress,
              }));
            }
          );

          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[currentIndex];
            return newProgress;
          });

          if (uploaded && (uploaded.url || uploaded.publicId)) {
            // Replace base64 preview với Cloudinary metadata (ưu tiên publicId)
            // Dùng tempId để tìm đúng ảnh (chính xác hơn base64)
            setImages((prev) => {
              const updated = [...prev];
              const idx = updated.findIndex(
                (img) => img.tempId === currentIndex
              );
              if (idx !== -1) {
                updated[idx] = {
                  url: uploaded.url, // Giữ để hiển thị preview
                  publicId: uploaded.publicId, // Gửi publicId lên BE (tối ưu hơn)
                  mimeType: uploaded.mimeType,
                  width: uploaded.width,
                  height: uploaded.height,
                  format: uploaded.format,
                  // Giữ tempId để tiếp tục track nếu cần
                  tempId: currentIndex,
                  // Không cần base64 nữa (đã có url từ Cloudinary)
                };
              }
              return updated;
            });
            toastSuccess("Tải ảnh lên thành công");
            return uploaded;
          } else {
            toastError("Không nhận được metadata ảnh từ server");
            return null;
          }
        } catch (uploadError: any) {
          const currentIndex = fileIndexRef.current - 1;
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[currentIndex];
            return newProgress;
          });

          // Remove preview if upload fails - dùng tempId để tìm chính xác
          setImages((prev) =>
            prev.filter((img) => img.tempId !== currentIndex)
          );

          // Check if rate limited
          if (uploadError?.response?.status === 429) {
            toastError(
              "Quá nhiều upload trong thời gian ngắn. Vui lòng đợi một chút."
            );
          } else {
            const errorMessage =
              uploadError?.response?.data?.message ||
              uploadError?.message ||
              "Lỗi khi tải ảnh lên";
            toastError(errorMessage);
          }
          return null;
        }
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi khi tải ảnh lên";
      toastError(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative animate-slide-up">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          {images.map((image, index) => (
            <div
              key={image.tempId ?? image.publicId ?? index}
              className="relative group animate-scale-in"
            >
              <img
                src={image.url || image.base64 || ""}
                alt={`Ảnh tải lên ${index + 1}`}
                className="w-20 h-20 object-cover rounded-2xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all"
              />
              {isUploading &&
                image.tempId !== undefined &&
                uploadProgress[image.tempId] !== undefined && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-xs rounded-2xl backdrop-blur-sm">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                    <div className="text-xs font-medium">
                      {uploadProgress[image.tempId] ?? 0}%
                    </div>
                    <div className="w-full max-w-[60px] h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-300"
                        style={{
                          width: `${uploadProgress[image.tempId] ?? 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-lg hover:scale-110 transition-transform shadow-lg"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-200/50 hover:border-red-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100 transition-all overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-yellow-500/5 pointer-events-none"></div>

        <div className="relative flex items-end space-x-3 p-4">
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex-shrink-0 p-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-100 hover:to-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 group"
          >
            {isUploading ? (
              <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*" // Chấp nhận mọi file ảnh
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 resize-none border-none outline-none bg-transparent text-gray-800 placeholder-gray-400 max-h-48 min-h-[28px] text-base"
            rows={1}
          />

          <button
            onClick={handleSubmit}
            disabled={(!message.trim() && images.length === 0) || disabled}
            className="flex-shrink-0 p-3 rounded-2xl bg-gradient-to-r from-red-500 to-yellow-500 text-white hover:from-red-600 hover:to-yellow-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-110 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            {disabled ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin relative z-10" />
            ) : (
              <svg
                className="w-6 h-6 relative z-10 group-hover:rotate-45 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 mt-3">
        <span className="flex items-center space-x-1">
          <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">
            Enter
          </kbd>
          <span>để gửi</span>
        </span>
        <span className="flex items-center space-x-1">
          <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">
            Shift + Enter
          </kbd>
          <span>để xuống dòng</span>
        </span>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InputBox;
