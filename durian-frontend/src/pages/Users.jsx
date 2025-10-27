import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Users as UsersIcon, Shield, User } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { user: currentUser, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'pekerja',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error loading users data. Make sure backend is running!');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/users/${formData.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving data');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Adakah anda pasti untuk memadam user ini?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      password: '', // Don't prefill password
    });
    setEditMode(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'pekerja',
    });
    setEditMode(false);
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return <span className="badge badge-danger flex items-center gap-1"><Shield size={14} /> Admin</span>;
    }
    return <span className="badge badge-info flex items-center gap-1"><User size={14} /> Pekerja</span>;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengurusan Pengguna</h1>
          <p className="text-gray-600">Urus akaun pekerja dan admin</p>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="hidden md:flex btn-primary items-center gap-2">
            <Plus size={20} />
            Tambah Pengguna
          </button>
        )}
      </div>

      {/* Mobile FAB - Admin only */}
      {isAdmin && (
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="fab md:hidden"
          aria-label="Tambah pengguna"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Jumlah Pengguna</p>
              <h3 className="text-3xl font-bold mt-2">{users.length}</h3>
            </div>
            <UsersIcon size={40} className="opacity-80" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Admin</p>
              <h3 className="text-3xl font-bold mt-2">{users.filter(u => u.role === 'admin').length}</h3>
            </div>
            <Shield size={40} className="opacity-80" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Pekerja</p>
              <h3 className="text-3xl font-bold mt-2">{users.filter(u => u.role === 'pekerja').length}</h3>
            </div>
            <User size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <UsersIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Tiada pengguna</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Tarikh Daftar</th>
                    {isAdmin && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.name}</td>
                      <td>{item.email}</td>
                      <td>{getRoleBadge(item.role)}</td>
                      <td>{new Date(item.created_at).toLocaleDateString('ms-MY')}</td>
                      {isAdmin && (
                        <td>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                            {item.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.map((item) => (
              <div key={item.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.email}</div>
                  </div>
                  {getRoleBadge(item.role)}
                </div>

                <div className="mobile-card-grid">
                  <div className="mobile-card-item col-span-2">
                    <span className="mobile-card-label">Tarikh Daftar</span>
                    <span className="mobile-card-value">
                      {new Date(item.created_at).toLocaleDateString('ms-MY')}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="mobile-card-actions">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn-icon-secondary flex-1"
                    >
                      <Edit size={20} />
                      <span className="ml-2">Edit</span>
                    </button>
                    {item.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-icon-danger flex-1"
                      >
                        <Trash2 size={20} />
                        <span className="ml-2">Hapus</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal - Admin Only */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editMode ? 'Edit Pengguna' : 'Tambah Pengguna'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nama *</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Password {editMode && '(Kosongkan jika tidak mahu ubah)'}</label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editMode}
                  placeholder={editMode ? 'Kosongkan jika tidak mahu ubah' : ''}
                />
              </div>
              <div>
                <label className="label">Role *</label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="pekerja">Pekerja (View Only)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Pekerja:</strong> Boleh view sahaja, tidak boleh tambah/edit/delete
                  <br />
                  <strong>Admin:</strong> Full access untuk semua fungsi
                </p>
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

export default Users;
