import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, Search, QrCode, Printer } from 'lucide-react';
import QRCodeModal from '../components/QRCodeModal';
import PhotoGallery from '../components/PhotoGallery';
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
  const [formData, setFormData] = useState({
    tag_no: '',
    varieti: '',
    umur: '',
    lokasi: '',
    tarikh_tanam: '',
    status_kesihatan: 'sihat',
    catatan: '',
  });

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
    });
    setEditMode(false);
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

        {/* Print Actions */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
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
          {selectedTrees.length > 0 && (
            <button
              onClick={() => {
                setPrintMode('batch');
                setShowPrintModal(true);
              }}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Printer size={16} />
              Print Selected ({selectedTrees.length})
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
                    <tr key={item.id}>
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
              <div key={item.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">{item.tag_no}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.varieti}</div>
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
