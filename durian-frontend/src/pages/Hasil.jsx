import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Hasil = () => {
  const [hasil, setHasil] = useState([]);
  const [pokok, setPokok] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    tree_id: '',
    tarikh_tuai: '',
    jumlah_biji: '',
    berat_kg: '',
    kualiti: 'B',
    catatan: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [hasilRes, pokokRes, statsRes] = await Promise.all([
        api.get('/hasil'),
        api.get('/pokok'),
        api.get('/hasil-statistics/monthly'),
      ]);
      setHasil(hasilRes.data.data.data);
      setPokok(pokokRes.data.data.data);
      setStats(statsRes.data.data);
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
        await api.put(`/hasil/${formData.id}`, formData);
      } else {
        await api.post('/hasil', formData);
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
        await api.delete(`/hasil/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tree_id: '',
      tarikh_tuai: '',
      jumlah_biji: '',
      berat_kg: '',
      kualiti: 'B',
      catatan: '',
    });
    setEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekod Hasil</h1>
          <p className="text-gray-600">Pengurusan rekod tuaian durian</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center">
          <Plus size={20} className="mr-2" />
          Tambah Hasil
        </button>
      </div>

      {/* Monthly Statistics Chart */}
      {stats?.yearly_trend && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Trend Hasil Tahunan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.yearly_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_berat" fill="#16a34a" name="Berat (kg)" />
              <Bar dataKey="total_harvest" fill="#3b82f6" name="Jumlah Tuaian" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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
                <th>Jumlah Biji</th>
                <th>Berat (kg)</th>
                <th>Kualiti</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {hasil.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.tarikh_tuai).toLocaleDateString('ms-MY')}</td>
                  <td className="font-medium">{item.tree?.tag_no}</td>
                  <td>{item.jumlah_biji}</td>
                  <td>{item.berat_kg} kg</td>
                  <td>
                    <span className={`badge ${item.kualiti === 'A' ? 'badge-success' : item.kualiti === 'B' ? 'badge-info' : 'badge-warning'}`}>
                      Grade {item.kualiti}
                    </span>
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
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Rekod Hasil' : 'Tambah Rekod Hasil'}</h2>
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
                  <label className="label">Tarikh Tuai</label>
                  <input type="date" className="input-field" value={formData.tarikh_tuai} onChange={(e) => setFormData({ ...formData, tarikh_tuai: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Jumlah Biji</label>
                  <input type="number" className="input-field" value={formData.jumlah_biji} onChange={(e) => setFormData({ ...formData, jumlah_biji: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Berat (kg)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.berat_kg} onChange={(e) => setFormData({ ...formData, berat_kg: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Kualiti</label>
                  <select className="input-field" value={formData.kualiti} onChange={(e) => setFormData({ ...formData, kualiti: e.target.value })}>
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Catatan</label>
                <textarea className="input-field" rows="3" value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}></textarea>
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

export default Hasil;
