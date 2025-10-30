import React, { useRef, useState } from "react";
import { Modal, Input, Button } from "../common";
import { useAuth } from "../../hooks/useAuth";
import { apiService } from "../../services/api";
import { setUser } from "../../utils/helpers";
import { chatService } from "../../services/chat.service";

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
      // tạm thời refresh để đồng bộ header/user context
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Profile Settings">
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="relative w-16 h-16">
            <img
              src={
                avatar ||
                user?.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  `${firstName || ""} ${lastName || ""}`
                )}&background=random&color=fff&size=96`
              }
              alt="avatar"
              className="w-16 h-16 rounded-full border object-cover"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 text-white text-xs opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Change avatar"
            >
              {uploading ? "Uploading..." : "Change"}
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
                  const url =
                    (uploaded as any).secureUrl || (uploaded as any).url;
                  if (url && /^https?:\/\//i.test(url)) {
                    setAvatar(url);
                    try {
                      // auto-save avatar immediately
                      const res = await apiService.updateProfile({
                        avatar: url,
                      });
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
          <div className="flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="First name"
            value={firstName}
            onChange={(e: any) => setFirstName(e.target.value)}
          />
          <Input
            label="Last name"
            value={lastName}
            onChange={(e: any) => setLastName(e.target.value)}
          />
        </div>

        <Input label="Email" value={user?.email || ""} disabled />

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="text" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
