import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, Filter, Upload, X, Image as ImageIcon } from 'lucide-react';

const Inspeksi = () => {
  const [inspeksi, setInspeksi] = useState([]);
  const [pokok, setPokok] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    tree_id: '',
    tarikh_inspeksi: '',
    pemeriksa: '',
    status: 'sihat',
    tindakan: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const [inspeksiRes, pokokRes] = await Promise.all([
        api.get('/inspeksi', { params }),
        api.get('/pokok'),
      ]);
      setInspeksi(inspeksiRes.data.data.data);
      setPokok(pokokRes.data.data.data);
    } catch (error) {
      console.error('Error fetching inspeksi data:', error);
      alert('Error loading inspeksi data. Make sure backend is running!');
      // Set default empty arrays to prevent blank page
      setInspeksi([]);
      setPokok([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) submitData.append(key, formData[key]);
      });

      if (imageFile) {
        submitData.append('gambar', imageFile);
      }

      if (editMode) {
        await api.post(`/inspeksi/${formData.id}?_method=PUT`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/inspeksi', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving data');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Adakah anda pasti untuk memadam rekod ini?')) {
      try {
        await api.delete(`/inspeksi/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tree_id: '',
      tarikh_inspeksi: '',
      pemeriksa: '',
      status: 'sihat',
      tindakan: '',
    });
    setImageFile(null);
    setImagePreview(null);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekod Inspeksi</h1>
          <p className="text-gray-600">Pengurusan inspeksi kesihatan pokok</p>
        </div>
        {/* Desktop Add Button */}
        <button onClick={() => { resetForm(); setShowModal(true); }} className="hidden md:flex btn-primary items-center gap-2">
          <Plus size={20} />
          Tambah Inspeksi
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => { resetForm(); setShowModal(true); }}
        className="fab md:hidden"
        aria-label="Tambah inspeksi"
      >
        <Plus size={24} />
      </button>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-400" />
          <select
            className="input-field flex-1 md:w-64"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="sihat">Sihat</option>
            <option value="sederhana">Sederhana</option>
            <option value="kurang sihat">Kurang Sihat</option>
            <option value="kritikal">Kritikal</option>
          </select>
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
                    <th>Tarikh</th>
                    <th>Pokok</th>
                    <th>Pemeriksa</th>
                    <th>Status</th>
                    <th>Tindakan</th>
                    <th>Gambar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inspeksi.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.tarikh_inspeksi).toLocaleDateString('ms-MY')}</td>
                      <td className="font-medium">{item.tree?.tag_no}</td>
                      <td>{item.pemeriksa}</td>
                      <td>
                        <span className={`badge ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="text-sm">{item.tindakan || '-'}</td>
                      <td>
                        {item.gambar ? (
                          <a
                            href={`http://localhost:8000/storage/${item.gambar}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-800"
                          >
                            <ImageIcon size={20} />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button onClick={() => { setFormData(item); setEditMode(true); setShowModal(true); }} className="text-blue-600 hover:text-blue-800">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
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
            {inspeksi.map((item) => (
              <div key={item.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">{item.tree?.tag_no}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.tarikh_inspeksi).toLocaleDateString('ms-MY')}
                    </div>
                  </div>
                  <span className={`badge ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>

                <div className="mobile-card-grid">
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Pemeriksa</span>
                    <span className="mobile-card-value">{item.pemeriksa}</span>
                  </div>
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Gambar</span>
                    {item.gambar ? (
                      <a
                        href={`http://localhost:8000/storage/${item.gambar}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 flex items-center gap-1"
                      >
                        <ImageIcon size={16} />
                        <span className="text-xs">Lihat</span>
                      </a>
                    ) : (
                      <span className="mobile-card-value text-gray-400">-</span>
                    )}
                  </div>
                  {item.tindakan && (
                    <div className="mobile-card-item col-span-2">
                      <span className="mobile-card-label">Tindakan</span>
                      <span className="mobile-card-value text-sm">{item.tindakan}</span>
                    </div>
                  )}
                </div>

                <div className="mobile-card-actions">
                  <button
                    onClick={() => { setFormData(item); setEditMode(true); setShowModal(true); }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Rekod Inspeksi' : 'Tambah Rekod Inspeksi'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Pokok</label>
                  <select className="input-field" value={formData.tree_id} onChange={(e) => setFormData({ ...formData, tree_id: e.target.value })} required>
                    <option value="">Pilih Pokok</option>
                    {pokok.map((p) => (
                      <option key={p.id} value={p.id}>{p.tag_no} - {p.varieti}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Tarikh Inspeksi</label>
                  <input type="date" className="input-field" value={formData.tarikh_inspeksi} onChange={(e) => setFormData({ ...formData, tarikh_inspeksi: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Pemeriksa</label>
                  <input type="text" className="input-field" value={formData.pemeriksa} onChange={(e) => setFormData({ ...formData, pemeriksa: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    <option value="sihat">Sihat</option>
                    <option value="sederhana">Sederhana</option>
                    <option value="kurang sihat">Kurang Sihat</option>
                    <option value="kritikal">Kritikal</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Tindakan</label>
                <textarea className="input-field" rows="3" value={formData.tindakan} onChange={(e) => setFormData({ ...formData, tindakan: e.target.value })}></textarea>
              </div>

              {/* Image Upload */}
              <div>
                <label className="label">Gambar (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="text-gray-400 mb-2" size={40} />
                      <span className="text-sm text-gray-600">Click untuk upload / ambil gambar</span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary w-full md:w-auto order-2 md:order-1">Batal</button>
                <button type="submit" className="btn-primary w-full md:w-auto order-1 md:order-2">{editMode ? 'Kemaskini' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspeksi;
