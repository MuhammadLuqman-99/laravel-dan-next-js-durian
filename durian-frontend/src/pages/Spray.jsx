import { useState, useEffect } from 'react';
import api from '../utils/api';
import offlineApi from '../utils/offlineApi';
import syncManager from '../utils/syncManager';
import { Plus, Edit, Trash2, Droplet, AlertCircle, Clock } from 'lucide-react';

const Spray = () => {
  const [spray, setSpray] = useState([]);
  const [pokok, setPokok] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filterJenis, setFilterJenis] = useState('');
  const [formData, setFormData] = useState({
    tree_id: '',
    tarikh_spray: '',
    jenis: 'racun',
    nama_bahan: '',
    dosage: '',
    interval_hari: 14,
    pekerja: '',
    catatan: '',
  });

  useEffect(() => {
    fetchData();

    // Listen for sync completion to refresh data
    syncManager.addSyncListener((event) => {
      if (event === 'sync_complete') {
        fetchData();
      }
    });
  }, [filterJenis]);

  const fetchData = async () => {
    try {
      const params = filterJenis ? { jenis: filterJenis } : {};
      const [sprayRes, pokokRes] = await Promise.all([
        offlineApi.get('/spray', { params }),
        offlineApi.get('/pokok'),
      ]);

      // Handle offline cached data
      const sprayData = sprayRes.data.data?.data || sprayRes.data.data || [];
      const pokokData = pokokRes.data.data?.data || pokokRes.data.data || [];

      setSpray(sprayData);
      setPokok(pokokData);

      // Show notification if data is from cache
      if (sprayRes.fromCache || pokokRes.fromCache) {
        console.log('⚠️ Viewing cached data (offline mode)');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editMode) {
        response = await offlineApi.put(`/spray/${formData.id}`, formData);
      } else {
        response = await offlineApi.post('/spray', formData);
      }

      // Show message if queued for offline sync
      if (response.offline) {
        alert('✓ Data saved offline. Will sync when online.');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Adakah anda pasti untuk memadam rekod ini?')) {
      try {
        const response = await offlineApi.delete(`/spray/${id}`);

        // Show message if queued for offline sync
        if (response.offline) {
          alert('✓ Delete queued. Will sync when online.');
        }

        fetchData();
      } catch (error) {
        alert('Error deleting data');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      tree_id: '',
      tarikh_spray: '',
      jenis: 'racun',
      nama_bahan: '',
      dosage: '',
      interval_hari: 14,
      pekerja: '',
      catatan: '',
    });
    setEditMode(false);
  };

  const calculateDaysRemaining = (tarikh, interval) => {
    const sprayDate = new Date(tarikh);
    const nextSprayDate = new Date(sprayDate.setDate(sprayDate.getDate() + parseInt(interval)));
    const today = new Date();
    const diffTime = nextSprayDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (tarikh, interval) => {
    const daysRemaining = calculateDaysRemaining(tarikh, interval);

    if (daysRemaining < 0) {
      return <span className="badge badge-danger">Overdue {Math.abs(daysRemaining)} hari</span>;
    } else if (daysRemaining <= 3) {
      return <span className="badge badge-warning">Due in {daysRemaining} hari</span>;
    } else {
      return <span className="badge badge-success">{daysRemaining} hari lagi</span>;
    }
  };

  const jenisList = ['racun', 'foliar', 'pesticide', 'fungicide', 'lain-lain'];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekod Spray/Racun</h1>
          <p className="text-gray-600 mt-1">Track semua aktiviti spray dan foliar</p>
        </div>
        {/* Desktop Add Button */}
        <button onClick={() => setShowModal(true)} className="hidden md:flex btn-primary gap-2">
          <Plus size={20} />
          Tambah Baru
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fab md:hidden"
        aria-label="Tambah spray baru"
      >
        <Plus size={24} />
      </button>

      {/* Filter & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Rekod</p>
              <h3 className="text-3xl font-bold mt-2">{spray.length}</h3>
            </div>
            <Droplet size={40} className="opacity-80" />
          </div>
        </div>

        <div className="card">
          <label className="label">Filter Jenis</label>
          <select
            className="input-field"
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua</option>
            {jenisList.map(j => (
              <option key={j} value={j}>{j.charAt(0).toUpperCase() + j.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Display - Table for Desktop, Cards for Mobile */}
      {loading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </div>
        </div>
      ) : spray.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Droplet className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Tiada rekod spray</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Tarikh</th>
                    <th>Pokok</th>
                    <th>Jenis</th>
                    <th>Nama Bahan</th>
                    <th>Dosage</th>
                    <th>Pekerja</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {spray.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.tarikh_spray).toLocaleDateString('ms-MY')}</td>
                      <td className="font-medium">{item.tree?.tag_no}</td>
                      <td>
                        <span className="badge badge-info">
                          {item.jenis}
                        </span>
                      </td>
                      <td>{item.nama_bahan}</td>
                      <td className="text-sm">{item.dosage || '-'}</td>
                      <td>{item.pekerja}</td>
                      <td>{getStatusBadge(item.tarikh_spray, item.interval_hari)}</td>
                      <td>
                        <div className="flex space-x-2">
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

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {spray.map((item) => (
              <div key={item.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">{item.tree?.tag_no}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.tarikh_spray).toLocaleDateString('ms-MY')}
                    </div>
                  </div>
                  {getStatusBadge(item.tarikh_spray, item.interval_hari)}
                </div>

                <div className="mobile-card-grid">
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Jenis</span>
                    <span className="badge badge-info inline-flex w-fit">
                      {item.jenis}
                    </span>
                  </div>
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Pekerja</span>
                    <span className="mobile-card-value">{item.pekerja}</span>
                  </div>
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Nama Bahan</span>
                    <span className="mobile-card-value">{item.nama_bahan}</span>
                  </div>
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Dosage</span>
                    <span className="mobile-card-value">{item.dosage || '-'}</span>
                  </div>
                </div>

                <div className="mobile-card-actions">
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="text-xl font-semibold mb-4">
              {editMode ? 'Edit Rekod Spray' : 'Tambah Rekod Spray'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Pokok *</label>
                  <select
                    className="input-field"
                    value={formData.tree_id}
                    onChange={(e) => setFormData({ ...formData, tree_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Pokok</option>
                    {pokok.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.tag_no} - {p.varieti}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Tarikh Spray *</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.tarikh_spray}
                    onChange={(e) => setFormData({ ...formData, tarikh_spray: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Jenis *</label>
                  <select
                    className="input-field"
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                    required
                  >
                    {jenisList.map(j => (
                      <option key={j} value={j}>{j.charAt(0).toUpperCase() + j.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Nama Bahan *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: Decis 2.5EC"
                    value={formData.nama_bahan}
                    onChange={(e) => setFormData({ ...formData, nama_bahan: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Dosage</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Contoh: 50ml per liter"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Interval Hari *</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="14"
                    value={formData.interval_hari}
                    onChange={(e) => setFormData({ ...formData, interval_hari: e.target.value })}
                    required
                    min="1"
                    max="90"
                  />
                  <p className="text-xs text-gray-500 mt-1">Berapa hari sebelum spray seterusnya</p>
                </div>
              </div>

              <div>
                <label className="label">Pekerja *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nama pekerja"
                  value={formData.pekerja}
                  onChange={(e) => setFormData({ ...formData, pekerja: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Catatan</label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Catatan tambahan..."
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                ></textarea>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn-secondary w-full md:w-auto order-2 md:order-1"
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary w-full md:w-auto order-1 md:order-2">
                  {editMode ? 'Kemaskini' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spray;
