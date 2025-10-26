import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';

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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/inspeksi/${formData.id}`, formData);
      } else {
        await api.post('/inspeksi', formData);
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
    setEditMode(false);
  };

  const statusColors = {
    sihat: 'badge-success',
    sederhana: 'badge-warning',
    'kurang sihat': 'badge-warning',
    kritikal: 'badge-danger',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekod Inspeksi</h1>
          <p className="text-gray-600">Pengurusan inspeksi kesihatan pokok</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Tambah Inspeksi
        </button>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-400" />
          <select
            className="input-field w-64"
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

      <div className="table-container">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Tarikh</th>
                <th>Pokok</th>
                <th>Pemeriksa</th>
                <th>Status</th>
                <th>Tindakan</th>
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
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Rekod Inspeksi' : 'Tambah Rekod Inspeksi'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">Batal</button>
                <button type="submit" className="btn-primary">{editMode ? 'Kemaskini' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inspeksi;
