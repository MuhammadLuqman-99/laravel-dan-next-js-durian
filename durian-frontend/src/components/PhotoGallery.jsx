import { useState, useEffect } from 'react';
import { Camera, X, Trash2, Image as ImageIcon, Upload, Loader } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PhotoGallery = ({ photoableType, photoableId, allowUpload = true }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [viewingPhoto, setViewingPhoto] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (photoableType && photoableId) {
      fetchPhotos();
    }
  }, [photoableType, photoableId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/photos', {
        params: { photoable_type: photoableType, photoable_id: photoableId }
      });
      setPhotos(response.data);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('photoable_type', photoableType);
      formData.append('photoable_id', photoableId);

      selectedFiles.forEach(file => {
        formData.append('photos[]', file);
      });

      await api.post('/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Clear selection and refresh
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      await fetchPhotos();

      alert('Photo(s) uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return;

    try {
      await api.delete(`/photos/${photoId}`);
      await fetchPhotos();
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo.');
    }
  };

  const cancelSelection = () => {
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {allowUpload && isAdmin && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Camera size={18} className="text-primary-600" />
            Upload Photos
          </h3>

          {selectedFiles.length === 0 ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to select photos
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB each
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
            </label>
          ) : (
            <div className="space-y-3">
              {/* Preview Grid */}
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>

              {/* Upload Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload {selectedFiles.length} photo(s)
                    </>
                  )}
                </button>
                <button
                  onClick={cancelSelection}
                  disabled={uploading}
                  className="btn-secondary"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photo Gallery */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <ImageIcon size={18} className="text-primary-600" />
          Photos ({photos.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader size={24} className="animate-spin text-primary-600" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No photos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {photos.map(photo => (
              <div key={photo.id} className="relative group aspect-square">
                <img
                  src={photo.url}
                  alt={photo.file_name}
                  className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setViewingPhoto(photo)}
                />
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setViewingPhoto(null)}
        >
          <button
            onClick={() => setViewingPhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X size={32} />
          </button>
          <div className="max-w-4xl max-h-full">
            <img
              src={viewingPhoto.url}
              alt={viewingPhoto.file_name}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="bg-white p-4 rounded-b-lg mt-2">
              <p className="text-sm text-gray-600">
                Uploaded by {viewingPhoto.uploader?.name} on{' '}
                {new Date(viewingPhoto.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
