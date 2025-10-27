import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Activity, Filter, Calendar, User, FileText } from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filterModule, filterAction]);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (filterModule) params.module = filterModule;
      if (filterAction) params.action = filterAction;

      const response = await api.get('/activity-logs', { params });
      setLogs(response.data.data.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      alert('Error loading activity logs. Make sure backend is running!');
      // Set default empty array to prevent blank page
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const actionColors = {
    create: 'badge-success',
    update: 'badge-info',
    delete: 'badge-danger',
  };

  const actionLabels = {
    create: 'Tambah',
    update: 'Kemaskini',
    delete: 'Padam',
  };

  const moduleLabels = {
    pokok: 'Tanaman',
    baja: 'Baja',
    spray: 'Spray/Racun',
    hasil: 'Hasil',
    inspeksi: 'Inspeksi',
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600">Rekod semua perubahan dalam sistem</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Filter Module</label>
            <select
              className="input-field"
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
            >
              <option value="">Semua Module</option>
              <option value="pokok">Tanaman</option>
              <option value="baja">Baja</option>
              <option value="spray">Spray/Racun</option>
              <option value="hasil">Hasil</option>
              <option value="inspeksi">Inspeksi</option>
            </select>
          </div>
          <div>
            <label className="label">Filter Action</label>
            <select
              className="input-field"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            >
              <option value="">Semua Action</option>
              <option value="create">Tambah</option>
              <option value="update">Kemaskini</option>
              <option value="delete">Padam</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Display */}
      {loading ? (
        <div className="card">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <Activity className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Tiada activity logs</p>
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
                    <th>Pengguna</th>
                    <th>Action</th>
                    <th>Module</th>
                    <th>Penerangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-sm">
                        {new Date(log.created_at).toLocaleString('ms-MY', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="font-medium">{log.user?.name || 'Unknown'}</td>
                      <td>
                        <span className={`badge ${actionColors[log.action]}`}>
                          {actionLabels[log.action]}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm font-medium text-gray-700">
                          {moduleLabels[log.module]}
                        </span>
                      </td>
                      <td className="text-sm">{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="mobile-card">
                <div className="mobile-card-header">
                  <div>
                    <div className="mobile-card-title">{log.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log.created_at).toLocaleString('ms-MY', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                  <span className={`badge ${actionColors[log.action]}`}>
                    {actionLabels[log.action]}
                  </span>
                </div>

                <div className="mobile-card-grid">
                  <div className="mobile-card-item">
                    <span className="mobile-card-label">Module</span>
                    <span className="mobile-card-value">{moduleLabels[log.module]}</span>
                  </div>
                  <div className="mobile-card-item col-span-2">
                    <span className="mobile-card-label">Penerangan</span>
                    <span className="mobile-card-value text-sm">{log.description}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityLogs;
