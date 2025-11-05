import React, { useRef, useState } from "react";
import { Modal, Input } from "../common";
import { useAuth } from "../../hooks/useAuth";
import { apiService } from "../../services/api";
import { setUser } from "../../utils/helpers";
import { chatService } from "../../services/chat.service";

// Import icons as unknown then cast → avoids TS 5.5 JSX error
import {
  FiUser as _FiUser,
  FiMail as _FiMail,
  FiCamera as _FiCamera,
  FiInfo as _FiInfo,
  FiCheck as _FiCheck,
  FiX as _FiX,
  FiLoader as _FiLoader,
} from "react-icons/fi";

const FiUser = _FiUser as React.ElementType;
const FiMail = _FiMail as React.ElementType;
const FiCamera = _FiCamera as React.ElementType;
const FiInfo = _FiInfo as React.ElementType;
const FiCheck = _FiCheck as React.ElementType;
const FiX = _FiX as React.ElementType;
const FiLoader = _FiLoader as React.ElementType;

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSave = async () => {
    try {
      setSaving(true);
      const payload: any = { firstName, lastName };
      if (avatar && /^https?:\/\//i.test(avatar)) {
        payload.avatar = avatar;
      }
      const res = await apiService.updateProfile(payload);
      setUser(res.data);
      onClose();
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative -m-6 mb-6 p-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-yellow-400/20"></div>
          <div className="relative flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-yellow-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <img
                  src={
                    avatar ||
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${firstName || ""} ${lastName || ""}`
                    )}&background=random&color=fff&size=192`
                  }
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm text-white text-sm opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center space-y-1"
                  title="Đổi avatar"
                >
                  {uploading ? (
                    <FiLoader className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <FiCamera className="w-6 h-6" />
                      <span className="text-xs">Đổi ảnh</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      setUploading(true);
                      const uploaded = await chatService.uploadImage(f);
                      const url = (uploaded as any).secureUrl || (uploaded as any).url;
                      if (url && /^https?:\/\//i.test(url)) {
                        setAvatar(url);
                        try {
                          const res = await apiService.updateProfile({ avatar: url });
                          setUser(res.data);
                        } catch (err) {
                          console.error("Failed to save avatar:", err);
                        }
                      }
                    } finally {
                      setUploading(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-1">
                Thông tin cá nhân
              </h2>
              <p className="text-white/90 text-sm">Cập nhật hồ sơ của bạn</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 animate-slide-up">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tên
              </label>
              <div className="relative">
                <div className="flex items-center space-x-4">
                  {/* Icon outside the input */}
                  <div className="flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-red-50 border-2 border-red-100 flex items-center justify-center text-red-600 shadow-sm">
                      <FiUser className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Input with cleaner styling */}
                  <Input
                    value={firstName}
                    onChange={(e: any) => setFirstName(e.target.value)}
                    placeholder="Nhập tên"
                    className="pr-4 w-full rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 animate-slide-up animation-delay-100">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Họ
              </label>
              <div className="relative">
                
                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-red-50 border-2 border-red-100 flex items-center justify-center text-red-600 shadow-sm">
                      <FiUser className="w-5 h-5" />
                    </div>
                  </div>
                <Input
                  value={lastName}
                  onChange={(e: any) => setLastName(e.target.value)}
                  placeholder="Nhập họ"
                  className="pl-12 pr-4 w-full rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                />
                </div>

              </div>

              
            </div>
          </div>

          <div className="space-y-2 animate-slide-up animation-delay-200">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <Input
                value={user?.email || ""}
                disabled
                className="pl-12 pr-4 w-full rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500 flex items-center space-x-1">
              <FiInfo className="w-3 h-3" />
              <span>Email không thể thay đổi</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-2xl border-2 border-red-100 animate-slide-up animation-delay-300">
            <div className="text-center">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600">
                {user?.email?.length || 0}
              </div>
              <div className="text-xs text-gray-600 mt-1">Email chars</div>
            </div>
            <div className="text-center border-l border-r border-red-200">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600">
                {(firstName + lastName).length}
              </div>
              <div className="text-xs text-gray-600 mt-1">Name chars</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-600">
                {avatar ? <FiCheck /> : <FiX />}
              </div>
              <div className="text-xs text-gray-600 mt-1">Avatar</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 animate-slide-up animation-delay-400">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="group relative px-8 py-3 bg-gradient-to-r from-red-500 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center space-x-2">
              {saving ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <style>{`
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
      `}</style>
    </Modal>
  );
};

export default ProfileModal;
