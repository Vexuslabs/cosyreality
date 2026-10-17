import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Link as LinkIcon, X, Check, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../../firebase/firebase';
import { Button } from './Button';

interface ImageUploaderProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  storagePath?: string;
  placeholder?: string;
  helperText?: string;
}

const PRESET_REAL_ESTATE_IMAGES = [
  { label: 'Villa/Estate', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Highrise Resid.', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Commercial Hub', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Plotted Land', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Modern Interior', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Master Layout', url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1200&q=80' },
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  storagePath = 'general',
  placeholder = 'Enter image URL or choose file',
  helperText,
}) => {
  const [tab, setTab] = useState<'url' | 'file' | 'presets'>('url');
  const [urlInput, setUrlInput] = useState<string>(value || '');
  const [uploading, setUploading] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (isFirebaseConfigured && storage) {
      try {
        setUploading(true);
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const fileRef = ref(storage, `${storagePath}/${fileName}`);
        await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(fileRef);
        onChange(downloadUrl);
        setUrlInput(downloadUrl);
      } catch (err) {
        console.error('Firebase Storage upload error:', err);
        // Fallback local reader for preview
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            onChange(reader.result as string);
            setUrlInput(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setUploading(false);
      }
    } else {
      // Local preview via FileReader
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onChange(reader.result as string);
          setUrlInput(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#103858]">
          {label}
        </label>
      )}

      {/* Mode Switcher */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit text-xs font-medium text-slate-600">
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`px-3 py-1 rounded-lg transition-colors ${
            tab === 'url' ? 'bg-white text-[#103858] font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Image URL
        </button>
        <button
          type="button"
          onClick={() => setTab('file')}
          className={`px-3 py-1 rounded-lg transition-colors ${
            tab === 'file' ? 'bg-white text-[#103858] font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setTab('presets')}
          className={`px-3 py-1 rounded-lg transition-colors ${
            tab === 'presets' ? 'bg-white text-[#103858] font-bold shadow-xs' : 'hover:text-slate-900'
          }`}
        >
          Presets
        </button>
      </div>

      {/* URL Tab */}
      {tab === 'url' && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="url"
              placeholder={placeholder}
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                onChange(e.target.value);
              }}
              className="w-full bg-white text-sm border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#103858]"
            />
          </div>
          <Button type="button" size="sm" variant="secondary" onClick={handleApplyUrl}>
            Apply
          </Button>
        </div>
      )}

      {/* File Upload Tab */}
      {tab === 'file' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-[#103858] bg-[#103858]/5'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#103858]">
              {uploading ? 'Uploading to Firebase Storage...' : 'Click to select or drag & drop image'}
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG, WebP up to 5MB</p>
          </div>
        </div>
      )}

      {/* Presets Tab */}
      {tab === 'presets' && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
          {PRESET_REAL_ESTATE_IMAGES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(preset.url);
                setUrlInput(preset.url);
              }}
              className={`group relative rounded-lg overflow-hidden border p-1 text-left transition-all ${
                value === preset.url
                  ? 'border-[#CCA02E] ring-2 ring-[#CCA02E]/30 bg-amber-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <img
                src={preset.url}
                alt={preset.label}
                referrerPolicy="no-referrer"
                className="w-full h-14 object-cover rounded"
              />
              <span className="block text-[10px] font-medium text-slate-700 truncate mt-1 text-center">
                {preset.label}
              </span>
              {value === preset.url && (
                <div className="absolute top-1.5 right-1.5 bg-[#CCA02E] text-white p-0.5 rounded-full">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
          <img
            src={value}
            alt="Preview"
            referrerPolicy="no-referrer"
            className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'https://placehold.co/600x400/103858/CCA02E?text=Cosy+Reality';
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#103858] truncate">Image Selected</p>
            <p className="text-[11px] text-slate-500 truncate">{value}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setUrlInput('');
            }}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
