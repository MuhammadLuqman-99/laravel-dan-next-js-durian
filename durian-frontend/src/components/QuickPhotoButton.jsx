import { useState, useRef } from 'react';
import { Camera, X, Upload, Check } from 'lucide-react';
import api from '../utils/api';

const QuickPhotoButton = ({ photoableType, photoableId, onPhotoUploaded, buttonText = "Quick Photo" }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowModal(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('photoable_type', photoableType);
      formData.append('photoable_id', photoableId);
      formData.append('photos[]', selectedFile);
      if (caption) formData.append('caption', caption);

      await api.post('/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Success
      setShowModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption('');

      if (onPhotoUploaded) onPhotoUploaded();
      alert('📸 Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setShowModal(false);
  };

  return (
    <>
      {/* Quick Photo Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn-primary flex items-center gap-2 shadow-lg w-full"
      >
        {typeof buttonText === 'string' ? (
          <>
            <Camera size={20} />
            {buttonText}
          </>
        ) : (
          buttonText
        )}
      </button>

      {/* Hidden File Input with Camera Capture */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
      />

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera size={20} className="text-primary-600" />
                Upload Photo
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Photo Preview */}
              {previewUrl && (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Caption Input (Optional) */}
              <div>
                <label className="label text-sm">Caption (optional)</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Pokok sihat, buah banyak..."
                  maxLength={200}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Upload Photo
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>

              {/* Helper Text */}
              <p className="text-xs text-gray-500 text-center">
                💡 Tip: Good photos help track pokok progress over time
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickPhotoButton;
