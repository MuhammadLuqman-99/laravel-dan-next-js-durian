import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Baja = () => {
  const [baja, setBaja] = useState([]);
  const [pokok, setPokok] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    tree_id: '',
    tarikh_baja: '',
    jenis_baja: '',
    jumlah: '',
    pekerja_id: '',
    catatan: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bajaRes, pokokRes] = await Promise.all([
        api.get('/baja'),
        api.get('/pokok'),
      ]);
      setBaja(bajaRes.data.data.data);
      setPokok(pokokRes.data.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/baja/${formData.id}`, formData);
      } else {
        await api.post('/baja', formData);
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
        await api.delete(`/baja/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tree_id: '',
      tarikh_baja: '',
      jenis_baja: '',
      jumlah: '',
      pekerja_id: '',
      catatan: '',
    });
    setEditMode(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekod Baja</h1>
          <p className="text-gray-600">Pengurusan rekod pembajaan</p>
        </div>
        {/* Desktop Add Button */}
        <button onClick={() => { resetForm(); setShowModal(true); }} className="hidden md:flex btn-primary items-center gap-2">
          <Plus size={20} />
          Tambah Rekod
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => { resetForm(); setShowModal(true); }}
        className="fab md:hidden"
        aria-label="Tambah rekod baja"
      >
        <Plus size={24} />
      </button>

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
                    <th>Jenis Baja</th>
                    <th>Jumlah (kg)</th>
                    <th>Pekerja</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {baja.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.tarikh_baja).toLocaleDateString('ms-MY')}</td>
                      <td className="font-medium">{item.tree?.tag_no}</td>
                      <td>{item.jenis_baja}</td>
                      <td>{item.jumlah} kg</td>
                      <td>{item.pekerja?.name}</td>
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
            {baja.map((item) => (
              <div key={item.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">{item.tree?.tag_no}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.tarikh_baja).toLocaleDateString('ms-MY')}
                    </div>
                  </div>
                  <span className="badge badge-success">{item.jumlah} kg</span>
                </div>

                <div className="mobile-card-grid">
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Jenis Baja</span>
                    <span className="mobile-card-value">{item.jenis_baja}</span>
                  </div>
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Pekerja</span>
                    <span className="mobile-card-value">{item.pekerja?.name || '-'}</span>
                  </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Rekod Baja' : 'Tambah Rekod Baja'}</h2>
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
                  <label className="label">Tarikh Baja</label>
                  <input type="date" className="input-field" value={formData.tarikh_baja} onChange={(e) => setFormData({ ...formData, tarikh_baja: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Jenis Baja</label>
                  <input type="text" className="input-field" value={formData.jenis_baja} onChange={(e) => setFormData({ ...formData, jenis_baja: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Jumlah (kg)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.jumlah} onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })} required />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Pekerja ID</label>
                  <input type="number" className="input-field" value={formData.pekerja_id} onChange={(e) => setFormData({ ...formData, pekerja_id: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label">Catatan</label>
                <textarea className="input-field" rows="3" value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}></textarea>
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

export default Baja;
