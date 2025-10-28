import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, Search, QrCode, Printer, MapPin, Camera, CheckSquare, Square, RefreshCw, Download } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';
import PhotoGallery from '../components/PhotoGallery';
import QuickPhotoButton from '../components/QuickPhotoButton';
import PrintLabelsModal from '../components/PrintLabelsModal';
import Pagination from '../components/Pagination';

const PokokDurian = () => {
  const [pokok, setPokok] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState('single');
  const [printTreeId, setPrintTreeId] = useState(null);
  const [selectedTrees, setSelectedTrees] = useState([]);
  const [selectedPokok, setSelectedPokok] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState('');
  const [formData, setFormData] = useState({
    tag_no: '',
    varieti: '',
    umur: '',
    lokasi: '',
    tarikh_tanam: '',
    status_kesihatan: 'sihat',
    catatan: '',
    latitude: '',
    longitude: '',
    gps_accuracy: '',
  });
  const [capturingGPS, setCapturingGPS] = useState(false);

  useEffect(() => {
    fetchPokok(1); // Reset to page 1 when search changes
  }, [search]);

  const fetchPokok = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: 50, // Request 50 items per page for large farms
        ...(search && { search })
      };
      const response = await api.get('/pokok', { params });
      setPokok(response.data.data.data);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total
      });
    } catch (error) {
      console.error('Error fetching pokok:', error);
      alert('Error loading pokok data. Make sure backend is running!');
      // Set default empty array to prevent blank page
      setPokok([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchPokok(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/pokok/${formData.id}`, formData);
      } else {
        await api.post('/pokok', formData);
      }
      setShowModal(false);
      resetForm();
      fetchPokok();
    } catch (error) {
      console.error('Error saving pokok:', error);
      alert(error.response?.data?.message || 'Error saving data');
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Adakah anda pasti untuk memadam pokok ini?')) {
      try {
        await api.delete(`/pokok/${id}`);
        fetchPokok();
      } catch (error) {
        console.error('Error deleting pokok:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tag_no: '',
      varieti: '',
      umur: '',
      lokasi: '',
      tarikh_tanam: '',
      status_kesihatan: 'sihat',
      catatan: '',
      latitude: '',
      longitude: '',
      gps_accuracy: '',
    });
    setEditMode(false);
  };

  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert('GPS tidak disokong oleh browser anda');
      return;
    }

    setCapturingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(8),
          longitude: position.coords.longitude.toFixed(8),
          gps_accuracy: position.coords.accuracy ? `${position.coords.accuracy.toFixed(2)}m` : '',
          gps_captured_at: new Date().toISOString(),
        });
        setCapturingGPS(false);
        alert(`GPS berjaya diambil!\nLatitude: ${position.coords.latitude.toFixed(6)}\nLongitude: ${position.coords.longitude.toFixed(6)}\nAccuracy: ±${position.coords.accuracy.toFixed(2)}m`);
      },
      (error) => {
        setCapturingGPS(false);
        let errorMsg = 'Gagal mendapatkan lokasi GPS';
        if (error.code === 1) {
          errorMsg = 'Sila benarkan akses lokasi di browser anda';
        } else if (error.code === 2) {
          errorMsg = 'Lokasi tidak tersedia. Pastikan GPS dihidupkan.';
        } else if (error.code === 3) {
          errorMsg = 'Timeout mendapatkan lokasi GPS';
        }
        alert(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Bulk Action Handlers
  const toggleBulkMode = () => {
    setBulkActionMode(!bulkActionMode);
    setSelectedTrees([]);
  };

  const toggleSelectTree = (treeId) => {
    setSelectedTrees(prev =>
      prev.includes(treeId)
        ? prev.filter(id => id !== treeId)
        : [...prev, treeId]
    );
  };

  const selectAllTrees = () => {
    if (selectedTrees.length === pokok.length) {
      setSelectedTrees([]);
    } else {
      setSelectedTrees(pokok.map(p => p.id));
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (!bulkUpdateStatus || selectedTrees.length === 0) {
      alert('Sila pilih status kesihatan');
      return;
    }

    try {
      await api.post('/pokok/bulk-update-status', {
        tree_ids: selectedTrees,
        status_kesihatan: bulkUpdateStatus
      });

      setShowBulkUpdateModal(false);
      setBulkUpdateStatus('');
      setSelectedTrees([]);
      setBulkActionMode(false);
      fetchPokok(pagination.current_page);
      alert(`Berjaya update ${selectedTrees.length} pokok!`);
    } catch (error) {
      console.error('Error bulk updating:', error);
      alert('Gagal update status. Sila cuba lagi.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTrees.length === 0) return;

    if (!window.confirm(`Adakah anda pasti untuk memadam ${selectedTrees.length} pokok?`)) {
      return;
    }

    try {
      await api.post('/pokok/bulk-delete', {
        tree_ids: selectedTrees
      });

      setSelectedTrees([]);
      setBulkActionMode(false);
      fetchPokok(pagination.current_page);
      alert(`Berjaya delete ${selectedTrees.length} pokok!`);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Gagal delete. Sila cuba lagi.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const idsParam = selectedTrees.length > 0
        ? `?ids=${selectedTrees.join(',')}`
        : '';

      const response = await api.get(`/pokok/export${idsParam}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pokok-durian-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      alert('Export berjaya!');
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Gagal export. Sila cuba lagi.');
    }
  };

  const statusColors = {
    sihat: 'badge-success',
    sederhana: 'badge-warning',
    'kurang sihat': 'badge-warning',
    kritikal: 'badge-danger',
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tanaman</h1>
          <p className="text-gray-600">Pengurusan data tanaman kebun</p>
        </div>
        {/* Desktop Add Button */}
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="hidden md:flex btn-primary items-center gap-2"
        >
          <Plus size={20} />
          Tambah Pokok
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        className="fab md:hidden"
        aria-label="Tambah pokok baru"
      >
        <Plus size={24} />
      </button>

      {/* Search & Actions */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-3">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Cari tag no, varieti, atau lokasi..."
            className="flex-1 px-4 py-2 border-none focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Bulk Actions Bar */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
          {/* Bulk Mode Toggle */}
          <button
            onClick={toggleBulkMode}
            className={`text-sm flex items-center gap-2 ${
              bulkActionMode ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {bulkActionMode ? <CheckSquare size={16} /> : <Square size={16} />}
            {bulkActionMode ? 'Mode Pilih Aktif' : 'Pilih Banyak'}
          </button>

          {/* Bulk Actions (shown when items selected) */}
          {bulkActionMode && selectedTrees.length > 0 && (
            <>
              <div className="flex items-center text-sm font-medium text-gray-700 px-3 py-2 bg-blue-50 rounded-lg">
                {selectedTrees.length} dipilih
              </div>

              <button
                onClick={() => setShowBulkUpdateModal(true)}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Update Status
              </button>

              <button
                onClick={handleBulkDelete}
                className="btn-danger text-sm flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>

              <button
                onClick={() => {
                  setPrintMode('batch');
                  setShowPrintModal(true);
                }}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <Printer size={16} />
                Print Labels
              </button>
            </>
          )}

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-sm flex items-center gap-2 ml-auto"
          >
            <Download size={16} />
            {selectedTrees.length > 0 ? `Export ${selectedTrees.length}` : 'Export All'}
          </button>

          {/* Print All (when not in bulk mode) */}
          {!bulkActionMode && (
            <button
              onClick={() => {
                setPrintMode('all');
                setShowPrintModal(true);
              }}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Printer size={16} />
              Print All Labels
            </button>
          )}
        </div>
      </div>

      {/* Data Display */}
      {loading ? (
        <div className="card">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {bulkActionMode && (
                      <th className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedTrees.length === pokok.length && pokok.length > 0}
                          onChange={selectAllTrees}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </th>
                    )}
                    <th>Tag No</th>
                    <th>Varieti</th>
                    <th>Umur</th>
                    <th>Lokasi</th>
                    <th>Tarikh Tanam</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pokok.map((item) => (
                    <tr
                      key={item.id}
                      className={`${
                        selectedTrees.includes(item.id) ? 'bg-blue-50' : ''
                      } hover:bg-gray-50 transition-colors`}
                    >
                      {bulkActionMode && (
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedTrees.includes(item.id)}
                            onChange={() => toggleSelectTree(item.id)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </td>
                      )}
                      <td className="font-medium">{item.tag_no}</td>
                      <td>{item.varieti}</td>
                      <td>{item.umur} tahun</td>
                      <td>{item.lokasi}</td>
                      <td>{new Date(item.tarikh_tanam).toLocaleDateString('ms-MY')}</td>
                      <td>
                        <span className={`badge ${statusColors[item.status_kesihatan]}`}>
                          {item.status_kesihatan}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setPrintMode('single');
                              setPrintTreeId(item.id);
                              setShowPrintModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-800"
                            title="Print Label"
                          >
                            <Printer size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPokok(item);
                              setShowQRModal(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Generate QR Code"
                          >
                            <QrCode size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {pokok.map((item) => (
              <div
                key={item.id}
                className={`mobile-card ${
                  selectedTrees.includes(item.id) ? 'ring-2 ring-primary-500 bg-blue-50' : ''
                }`}
              >
                <div className="mobile-card-header">
                  <div className="flex items-center gap-3">
                    {bulkActionMode && (
                      <input
                        type="checkbox"
                        checked={selectedTrees.includes(item.id)}
                        onChange={() => toggleSelectTree(item.id)}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    )}
                    <div>
                      <div className="mobile-card-title">{item.tag_no}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.varieti}</div>
                    </div>
                  </div>
                  <span className={`badge ${statusColors[item.status_kesihatan]}`}>
                    {item.status_kesihatan}
                  </span>
                </div>

                <div className="mobile-card-grid">
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Umur</span>
                    <span className="mobile-card-value">{item.umur} tahun</span>
                  </div>
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Lokasi</span>
                    <span className="mobile-card-value">{item.lokasi}</span>
                  </div>
                  <div className="mobile-card-item col-span-2">
                    <span className="mobile-card-label">Tarikh Tanam</span>
                    <span className="mobile-card-value">
                      {new Date(item.tarikh_tanam).toLocaleDateString('ms-MY')}
                    </span>
                  </div>
                </div>

                <div className="mobile-card-actions">
                  <div className="flex-1">
                    <QuickPhotoButton
                      photoableType="App\\Models\\PokokDurian"
                      photoableId={item.id}
                      onPhotoUploaded={() => fetchPokok(pagination.current_page)}
                      buttonText={
                        <div className="flex items-center justify-center gap-2">
                          <Camera size={20} />
                          <span>Foto</span>
                        </div>
                      }
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPokok(item);
                      setShowQRModal(true);
                    }}
                    className="btn-icon-secondary flex-1"
                  >
                    <QrCode size={20} />
                    <span className="ml-2">QR</span>
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn-icon-secondary flex-1"
                  >
                    <Edit size={20} />
                    <span className="ml-2">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-icon-danger flex-1"
                  >
                    <Trash2 size={20} />
                    <span className="ml-2">Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Edit Pokok' : 'Tambah Pokok Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tag No</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.tag_no}
                    onChange={(e) => setFormData({ ...formData, tag_no: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Varieti</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.varieti}
                    onChange={(e) => setFormData({ ...formData, varieti: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Umur (tahun)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.umur}
                    onChange={(e) => setFormData({ ...formData, umur: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Lokasi</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Tarikh Tanam</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.tarikh_tanam}
                    onChange={(e) => setFormData({ ...formData, tarikh_tanam: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Status Kesihatan</label>
                  <select
                    className="input-field"
                    value={formData.status_kesihatan}
                    onChange={(e) => setFormData({ ...formData, status_kesihatan: e.target.value })}
                  >
                    <option value="sihat">Sihat</option>
                    <option value="sederhana">Sederhana</option>
                    <option value="kurang sihat">Kurang Sihat</option>
                    <option value="kritikal">Kritikal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Catatan</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                ></textarea>
              </div>

              {/* GPS Coordinates Section */}
              <div className="col-span-2 border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Koordinat GPS (Opsional)</label>
                  <button
                    type="button"
                    onClick={captureGPS}
                    disabled={capturingGPS}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <MapPin size={16} />
                    {capturingGPS ? 'Menangkap GPS...' : 'Ambil Lokasi GPS'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-sm">Latitude</label>
                    <input
                      type="number"
                      step="0.00000001"
                      className="input-field"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="Contoh: 3.1390"
                    />
                  </div>
                  <div>
                    <label className="label text-sm">Longitude</label>
                    <input
                      type="number"
                      step="0.00000001"
                      className="input-field"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="Contoh: 101.6869"
                    />
                  </div>
                </div>
                {formData.latitude && formData.longitude && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    GPS: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                    {formData.gps_accuracy && ` (±${formData.gps_accuracy})`}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editMode ? 'Kemaskini' : 'Simpan'}
                </button>
              </div>
            </form>

            {/* Photo Gallery - Only show in edit mode */}
            {editMode && formData.id && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <PhotoGallery
                  photoableType="App\\Models\\PokokDurian"
                  photoableId={formData.id}
                  allowUpload={true}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedPokok(null);
        }}
        pokokId={selectedPokok?.id}
        tagNo={selectedPokok?.tag_no}
      />

      {/* Print Labels Modal */}
      <PrintLabelsModal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setPrintTreeId(null);
        }}
        mode={printMode}
        treeId={printTreeId}
        selectedTrees={selectedTrees}
      />

      {/* Bulk Update Status Modal */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <RefreshCw size={24} className="text-primary-600" />
              Update Status Kesihatan
            </h2>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {selectedTrees.length} pokok dipilih untuk update status
              </p>
            </div>

            <div className="mb-6">
              <label className="label">Status Kesihatan Baru</label>
              <select
                className="input-field"
                value={bulkUpdateStatus}
                onChange={(e) => setBulkUpdateStatus(e.target.value)}
              >
                <option value="">Pilih Status</option>
                <option value="sihat">Sihat</option>
                <option value="sederhana">Sederhana</option>
                <option value="kurang sihat">Kurang Sihat</option>
                <option value="kritikal">Kritikal</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowBulkUpdateModal(false);
                  setBulkUpdateStatus('');
                }}
                className="btn-secondary"
              >
                Batal
              </button>
              <button
                onClick={handleBulkUpdateStatus}
                disabled={!bulkUpdateStatus}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update {selectedTrees.length} Pokok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={pagination.per_page}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
};

export default PokokDurian;
