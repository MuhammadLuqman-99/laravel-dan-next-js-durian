import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, TrendingUp, DollarSign, Package } from 'lucide-react';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    tarikh_jual: new Date().toISOString().split('T')[0],
    nama_pembeli: '',
    no_telefon: '',
    jumlah_biji: '',
    berat_kg: '',
    gred: 'B',
    harga_sekg: '',
    status_bayaran: 'paid',
    jumlah_dibayar: '',
    catatan: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, statsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/sales-statistics'),
      ]);
      setSales(salesRes.data.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      alert('Error loading sales data. Make sure backend is running!');
      // Set default empty arrays to prevent blank page
      setSales([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/sales/${formData.id}`, formData);
      } else {
        await api.post('/sales', formData);
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
        await api.delete(`/sales/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tarikh_jual: new Date().toISOString().split('T')[0],
      nama_pembeli: '',
      no_telefon: '',
      jumlah_biji: '',
      berat_kg: '',
      gred: 'B',
      harga_sekg: '',
      status_bayaran: 'paid',
      jumlah_dibayar: '',
      catatan: '',
    });
    setEditMode(false);
  };

  const gredColors = {
    A: 'badge-success',
    B: 'badge-info',
    C: 'badge-warning',
  };

  const statusColors = {
    paid: 'badge-success',
    pending: 'badge-danger',
    partial: 'badge-warning',
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekod Jualan</h1>
          <p className="text-gray-600">Track jualan & pendapatan durian</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="hidden md:flex btn-primary items-center gap-2">
          <Plus size={20} />
          Tambah Jualan
        </button>
      </div>

      <button onClick={() => { resetForm(); setShowModal(true); }} className="fab md:hidden" aria-label="Tambah jualan">
        <Plus size={24} />
      </button>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Jumlah Jualan Tahun Ini</p>
                <h3 className="text-2xl font-bold mt-1">RM {stats.total_year.toFixed(2)}</h3>
              </div>
              <DollarSign className="opacity-80" size={36} />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Berat Terjual</p>
                <h3 className="text-2xl font-bold mt-1">{stats.total_weight_year.toFixed(1)} kg</h3>
              </div>
              <Package className="opacity-80" size={36} />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Pending Payment</p>
                <h3 className="text-2xl font-bold mt-1">RM {stats.pending_payments.toFixed(2)}</h3>
              </div>
              <TrendingUp className="opacity-80" size={36} />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Top Gred</p>
                <h3 className="text-2xl font-bold mt-1">
                  {stats.by_grade.length > 0 ? `Gred ${stats.by_grade[0].gred}` : '-'}
                </h3>
              </div>
              <TrendingUp className="opacity-80" size={36} />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card"><div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div></div>
      ) : (
        <>
          <div className="hidden md:block">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Tarikh</th><th>Pembeli</th><th>Gred</th><th>Berat (kg)</th><th>Harga/kg</th><th>Jumlah</th><th>Status</th><th>Aksi</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sales.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.tarikh_jual).toLocaleDateString('ms-MY')}</td>
                      <td className="font-medium">{item.nama_pembeli}</td>
                      <td><span className={`badge ${gredColors[item.gred]}`}>Gred {item.gred}</span></td>
                      <td>{parseFloat(item.berat_kg).toFixed(2)} kg</td>
                      <td>RM {parseFloat(item.harga_sekg).toFixed(2)}</td>
                      <td className="font-semibold text-green-600">RM {parseFloat(item.jumlah_harga).toFixed(2)}</td>
                      <td><span className={`badge ${statusColors[item.status_bayaran]}`}>{item.status_bayaran}</span></td>
                      <td>
                        <div className="flex space-x-2">
                          <button onClick={() => { setFormData(item); setEditMode(true); setShowModal(true); }} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {sales.map((item) => (
              <div key={item.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">{item.nama_pembeli}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(item.tarikh_jual).toLocaleDateString('ms-MY')}</div>
                  </div>
                  <span className={`badge ${gredColors[item.gred]}`}>Gred {item.gred}</span>
                </div>
                <div className="mobile-card-grid">
                  <div className="mobile-card-item"><span className="mobile-card-label">Berat</span><span className="mobile-card-value">{parseFloat(item.berat_kg).toFixed(2)} kg</span></div>
                  <div className="mobile-card-item"><span className="mobile-card-label">Harga/kg</span><span className="mobile-card-value">RM {parseFloat(item.harga_sekg).toFixed(2)}</span></div>
                  <div className="mobile-card-item"><span className="mobile-card-label">Jumlah</span><span className="mobile-card-value font-bold text-green-600">RM {parseFloat(item.jumlah_harga).toFixed(2)}</span></div>
                  <div className="mobile-card-item"><span className="mobile-card-label">Status</span><span className={`badge ${statusColors[item.status_bayaran]}`}>{item.status_bayaran}</span></div>
                </div>
                <div className="mobile-card-actions">
                  <button onClick={() => { setFormData(item); setEditMode(true); setShowModal(true); }} className="btn-icon-secondary flex-1"><Edit size={20} /><span className="ml-2">Edit</span></button>
                  <button onClick={() => handleDelete(item.id)} className="btn-icon-danger flex-1"><Trash2 size={20} /><span className="ml-2">Hapus</span></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Jualan' : 'Tambah Jualan'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Tarikh Jual</label><input type="date" className="input-field" value={formData.tarikh_jual} onChange={(e) => setFormData({ ...formData, tarikh_jual: e.target.value })} required /></div>
                <div><label className="label">Nama Pembeli</label><input type="text" className="input-field" value={formData.nama_pembeli} onChange={(e) => setFormData({ ...formData, nama_pembeli: e.target.value })} placeholder="Nama pelanggan" required /></div>
                <div><label className="label">No. Telefon</label><input type="text" className="input-field" value={formData.no_telefon} onChange={(e) => setFormData({ ...formData, no_telefon: e.target.value })} placeholder="012-3456789" /></div>
                <div><label className="label">Gred</label><select className="input-field" value={formData.gred} onChange={(e) => setFormData({ ...formData, gred: e.target.value })} required><option value="A">Gred A (Premium)</option><option value="B">Gred B (Standard)</option><option value="C">Gred C (Economy)</option></select></div>
                <div><label className="label">Jumlah Biji</label><input type="number" className="input-field" value={formData.jumlah_biji} onChange={(e) => setFormData({ ...formData, jumlah_biji: e.target.value })} min="1" required /></div>
                <div><label className="label">Berat (kg)</label><input type="number" step="0.01" className="input-field" value={formData.berat_kg} onChange={(e) => setFormData({ ...formData, berat_kg: e.target.value })} min="0" required /></div>
                <div><label className="label">Harga Per KG (RM)</label><input type="number" step="0.01" className="input-field" value={formData.harga_sekg} onChange={(e) => setFormData({ ...formData, harga_sekg: e.target.value })} min="0" required /></div>
                <div><label className="label">Status Bayaran</label><select className="input-field" value={formData.status_bayaran} onChange={(e) => setFormData({ ...formData, status_bayaran: e.target.value })} required><option value="paid">Paid (Lunas)</option><option value="partial">Partial (Sebahagian)</option><option value="pending">Pending (Belum Bayar)</option></select></div>
                {formData.status_bayaran !== 'paid' && (<div><label className="label">Jumlah Dibayar (RM)</label><input type="number" step="0.01" className="input-field" value={formData.jumlah_dibayar} onChange={(e) => setFormData({ ...formData, jumlah_dibayar: e.target.value })} min="0" /></div>)}
              </div>
              <div><label className="label">Catatan</label><textarea className="input-field" rows="2" value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} placeholder="Nota tambahan"></textarea></div>
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

export default Sales;
