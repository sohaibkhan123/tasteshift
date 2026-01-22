
import React, { useState } from 'react';
import { Camera, X, ChevronLeft } from 'lucide-react';
import { User } from '../types';

interface EditProfileProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<User>({ ...user });
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use FileReader to generate a Base64 string which persists across reloads/backend
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white md:rounded-xl shadow-sm overflow-hidden min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-full transition md:hidden">
            <ChevronLeft size={24} />
          </button>
          <button onClick={onCancel} className="hidden md:block text-sm font-semibold text-gray-500 hover:text-gray-800">
            Cancel
          </button>
          <h2 className="text-lg font-bold">Edit Profile</h2>
        </div>
        <button
          onClick={handleSubmit}
          className="text-brand-orange font-bold text-sm hover:text-orange-700 transition"
        >
          Done
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-12 max-w-2xl mx-auto w-full space-y-8">
        {/* Avatar Selection */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm relative">
              <img
                src={avatarPreview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=FF6B35&color=fff`; }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center cursor-pointer">
                <Camera className="text-white opacity-80" size={24} />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleAvatarChange}
            />
          </div>
          <button type="button" className="text-brand-orange text-xs font-bold hover:underline">
            Change profile photo
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Username</label>
            <input
              type="text"
              name="handle"
              value={formData.handle}
              onChange={handleChange}
              placeholder="@username"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about your culinary journey..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Website</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="yoursite.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-orange/20 outline-none transition"
            />
          </div>
        </div>

        {/* Private Account Toggle (Simulated) */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Private Account</h3>
            <p className="text-xs text-gray-500">Only your followers can see your posts and recipes.</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
            className={`w-11 h-6 rounded-full transition-colors relative ${formData.isPrivate ? 'bg-brand-orange' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPrivate ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="pt-10 flex flex-col md:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-6 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-6 bg-brand-orange text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
