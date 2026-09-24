import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2, Check } from 'lucide-react';
import api from '../../services/api';

const ImageUploadZone = ({
  images = [],
  onChange,
  maxImages = 3,
  type = 'BEFORE',
  label = 'Upload Issue Photo(s)',
  helpText = 'PNG, JPG, WEBP up to 5MB',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setError('');
    setUploading(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is larger than 5MB.`);
        }

        const formData = new FormData();
        formData.append('image', file);

        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.success && res.data?.url) {
          uploadedUrls.push({
            url: res.data.url,
            type: type.toUpperCase(),
            caption: file.name,
          });
        }
      }

      const updated = [...images, ...uploadedUrls].slice(0, maxImages);
      onChange(updated);
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {label}
        </label>
        <span className="text-[11px] text-slate-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      {/* Upload Drop Area */}
      {images.length < maxImages && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            uploading
              ? 'bg-slate-900/60 border-emerald-500/50'
              : 'border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/40 bg-slate-900/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={maxImages > 1}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-300 font-medium">Uploading & optimizing photo...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 mb-1">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-200">
                Click to browse or drop photo here
              </p>
              <p className="text-[11px] text-slate-500">{helpText}</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {images.map((img, idx) => {
            const imageUrl = typeof img === 'string' ? img : img.url;
            return (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video shadow-md"
              >
                <img
                  src={imageUrl}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-slate-950/80 text-rose-400 hover:bg-rose-600 hover:text-white transition-all opacity-90 group-hover:opacity-100 shadow-md"
                  title="Remove Image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-1 left-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-700">
                    {img.type || type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageUploadZone;
