import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Edit, Trash2, DollarSign, Filter, Receipt } from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filterKategori, setFilterKategori] = useState('');
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    tarikh: new Date().toISOString().split('T')[0],
    kategori: 'baja',
    item: '',
    kuantiti: 1,
    unit: '',
    harga_seunit: '',
    pembekal: '',
    catatan: '',
  });

  useEffect(() => {
    fetchData();
  }, [filterKategori]);

  const fetchData = async () => {
    try {
      const params = filterKategori ? { kategori: filterKategori } : {};
      const [expensesRes, statsRes] = await Promise.all([
        api.get('/expenses', { params }),
        api.get('/expenses-statistics'),
      ]);
      setExpenses(expensesRes.data.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching expenses data:', error);
      alert('Error loading expenses data. Make sure backend is running!');
      // Set default empty arrays to prevent blank page
      setExpenses([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/expenses/${formData.id}`, formData);
      } else {
        await api.post('/expenses', formData);
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
        await api.delete(`/expenses/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tarikh: new Date().toISOString().split('T')[0],
      kategori: 'baja',
      item: '',
      kuantiti: 1,
      unit: '',
      harga_seunit: '',
      pembekal: '',
      catatan: '',
    });
    setEditMode(false);
  };

  const kategoriColors = {
    baja: 'badge-success',
    racun: 'badge-warning',
    peralatan: 'badge-info',
    pekerja: 'badge-secondary',
    utiliti: 'badge-primary',
    'lain-lain': 'badge-gray',
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perbelanjaan Kebun</h1>
          <p className="text-gray-600">Track kos & perbelanjaan kebun durian</p>
        </div>
        {/* Desktop Add Button */}
        <button onClick={() => { resetForm(); setShowModal(true); }} className="hidden md:flex btn-primary items-center gap-2">
          <Plus size={20} />
          Tambah Perbelanjaan
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => { resetForm(); setShowModal(true); }}
        className="fab md:hidden"
        aria-label="Tambah perbelanjaan"
      >
        <Plus size={24} />
      </button>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Jumlah Tahun Ini</p>
                <h3 className="text-2xl font-bold mt-1">RM {stats.total_year.toFixed(2)}</h3>
              </div>
              <DollarSign className="opacity-80" size={40} />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Kategori Tertinggi</p>
                <h3 className="text-xl font-bold mt-1">
                  {stats.by_category.length > 0 ?
                    stats.by_category.reduce((max, item) => item.total > max.total ? item : max).kategori.toUpperCase()
                    : '-'}
                </h3>
              </div>
              <Receipt className="opacity-80" size={40} />
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Rekod Terkini</p>
                <h3 className="text-2xl font-bold mt-1">{stats.recent_expenses.length}</h3>
              </div>
              <Filter className="opacity-80" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-400" />
          <select
            className="input-field flex-1 md:w-64"
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="baja">Baja</option>
            <option value="racun">Racun/Pestisida</option>
            <option value="peralatan">Peralatan</option>
            <option value="pekerja">Upah Pekerja</option>
            <option value="utiliti">Utiliti</option>
            <option value="lain-lain">Lain-lain</option>
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
                    <th>Kategori</th>
                    <th>Item</th>
                    <th>Kuantiti</th>
                    <th>Harga/Unit</th>
                    <th>Jumlah</th>
                    <th>Pembekal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {expenses.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.tarikh).toLocaleDateString('ms-MY')}</td>
                      <td>
                        <span className={`badge ${kategoriColors[item.kategori]}`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td className="font-medium">{item.item}</td>
                      <td>{item.kuantiti} {item.unit}</td>
                      <td>RM {parseFloat(item.harga_seunit).toFixed(2)}</td>
                      <td className="font-semibold text-green-600">RM {parseFloat(item.jumlah).toFixed(2)}</td>
                      <td className="text-sm">{item.pembekal || '-'}</td>
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
            {expenses.map((item) => (
              <div key={item.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">{item.item}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(item.tarikh).toLocaleDateString('ms-MY')}
                    </div>
                  </div>
                  <span className={`badge ${kategoriColors[item.kategori]}`}>
                    {item.kategori}
                  </span>
                </div>

                <div className="mobile-card-grid">
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Kuantiti</span>
                    <span className="mobile-card-value">{item.kuantiti} {item.unit}</span>
                  </div>
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Harga/Unit</span>
                    <span className="mobile-card-value">RM {parseFloat(item.harga_seunit).toFixed(2)}</span>
                  </div>
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Jumlah</span>
                    <span className="mobile-card-value font-bold text-green-600">RM {parseFloat(item.jumlah).toFixed(2)}</span>
                  </div>
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Pembekal</span>
                    <span className="mobile-card-value">{item.pembekal || '-'}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Perbelanjaan' : 'Tambah Perbelanjaan'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Tarikh</label>
                  <input type="date" className="input-field" value={formData.tarikh} onChange={(e) => setFormData({ ...formData, tarikh: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Kategori</label>
                  <select className="input-field" value={formData.kategori} onChange={(e) => setFormData({ ...formData, kategori: e.target.value })} required>
                    <option value="baja">Baja</option>
                    <option value="racun">Racun/Pestisida</option>
                    <option value="peralatan">Peralatan</option>
                    <option value="pekerja">Upah Pekerja</option>
                    <option value="utiliti">Utiliti (Air/Elektrik)</option>
                    <option value="lain-lain">Lain-lain</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Item/Penerangan</label>
                  <input type="text" className="input-field" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} placeholder="Cth: NPK Fertilizer, Roundup Pesticide" required />
                </div>
                <div>
                  <label className="label">Kuantiti</label>
                  <input type="number" className="input-field" value={formData.kuantiti} onChange={(e) => setFormData({ ...formData, kuantiti: e.target.value })} min="1" required />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input type="text" className="input-field" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="kg, liter, pcs, hari" />
                </div>
                <div>
                  <label className="label">Harga Per Unit (RM)</label>
                  <input type="number" step="0.01" className="input-field" value={formData.harga_seunit} onChange={(e) => setFormData({ ...formData, harga_seunit: e.target.value })} min="0" required />
                </div>
                <div>
                  <label className="label">Pembekal</label>
                  <input type="text" className="input-field" value={formData.pembekal} onChange={(e) => setFormData({ ...formData, pembekal: e.target.value })} placeholder="Nama kedai/pembekal" />
                </div>
              </div>
              <div>
                <label className="label">Catatan</label>
                <textarea className="input-field" rows="3" value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} placeholder="Nota tambahan"></textarea>
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

export default Expenses;
