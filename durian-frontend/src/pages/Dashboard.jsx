import { useState, useEffect } from 'react';
import api from '../utils/api';
import { TreeDeciduous, TrendingUp, AlertTriangle, CheckCircle, Droplet, Clock, AlertOctagon, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import WeatherWidget from '../components/WeatherWidget';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/statistics');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Ringkasan aktiviti kebun durian</p>
      </div>

      {/* Stats Cards and Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Jumlah Pokok</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.total_pokok || 0}</h3>
              </div>
              <TreeDeciduous size={40} className="opacity-80" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Pokok Sihat</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.pokok_sihat || 0}</h3>
              </div>
              <CheckCircle size={40} className="opacity-80" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Pokok Kritikal</p>
                <h3 className="text-3xl font-bold mt-2">{stats?.pokok_kritikal || 0}</h3>
              </div>
              <AlertTriangle size={40} className="opacity-80" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Hasil Bulan Ini</p>
                <h3 className="text-3xl font-bold mt-2">
                  {stats?.hasil_bulan_ini?.total_berat?.toFixed(1) || 0} kg
                </h3>
              </div>
              <TrendingUp size={40} className="opacity-80" />
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="lg:col-span-1">
          <WeatherWidget />
        </div>
      </div>

      {/* Spray Alerts */}
      {(stats?.spray_overdue?.length > 0 || stats?.spray_due_soon?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overdue Sprays */}
          {stats?.spray_overdue?.length > 0 && (
            <div className="card border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertOctagon className="text-red-500" size={24} />
                  <h3 className="text-lg font-semibold text-red-700">Spray Overdue!</h3>
                </div>
                <span className="badge badge-danger">{stats.spray_overdue.length}</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.spray_overdue.map((spray) => {
                  const sprayDate = new Date(spray.tarikh_spray);
                  const nextDate = new Date(sprayDate.setDate(sprayDate.getDate() + parseInt(spray.interval_hari)));
                  const daysOverdue = Math.ceil((new Date() - nextDate) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={spray.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{spray.tree?.tag_no}</p>
                          <p className="text-sm text-gray-600">{spray.nama_bahan}</p>
                        </div>
                        <span className="text-sm font-semibold text-red-600">
                          {daysOverdue} hari lewat
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/spray" className="mt-4 btn-primary w-full text-center">
                Lihat Semua Spray
              </Link>
            </div>
          )}

          {/* Due Soon */}
          {stats?.spray_due_soon?.length > 0 && (
            <div className="card border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-yellow-500" size={24} />
                  <h3 className="text-lg font-semibold text-yellow-700">Spray Due Soon</h3>
                </div>
                <span className="badge badge-warning">{stats.spray_due_soon.length}</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.spray_due_soon.map((spray) => {
                  const sprayDate = new Date(spray.tarikh_spray);
                  const nextDate = new Date(sprayDate.setDate(sprayDate.getDate() + parseInt(spray.interval_hari)));
                  const daysLeft = Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={spray.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{spray.tree?.tag_no}</p>
                          <p className="text-sm text-gray-600">{spray.nama_bahan}</p>
                        </div>
                        <span className="text-sm font-semibold text-yellow-600">
                          {daysLeft} hari lagi
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/spray" className="mt-4 btn-secondary w-full text-center">
                Manage Spray
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Status Kesihatan Pokok</h3>
          <div className="space-y-3">
            {stats?.status_kesihatan?.map((item) => {
              const colors = {
                sihat: 'bg-green-500',
                sederhana: 'bg-yellow-500',
                'kurang sihat': 'bg-orange-500',
                kritikal: 'bg-red-500',
              };
              const percentage = ((item.count / stats.total_pokok) * 100).toFixed(1);

              return (
                <div key={item.status_kesihatan}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{item.status_kesihatan}</span>
                    <span className="font-medium">{item.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[item.status_kesihatan]} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Producing Trees */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top 5 Pokok Produktif</h3>
          <div className="space-y-3">
            {stats?.top_trees?.map((item, index) => (
              <div key={item.tree_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-bold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item.tree?.tag_no}</p>
                    <p className="text-xs text-gray-500">{item.tree?.varieti}</p>
                  </div>
                </div>
                <span className="font-semibold text-primary-600">
                  {item.total_berat?.toFixed(1)} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Inspeksi Terbaru</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tarikh</th>
                <th>Pokok</th>
                <th>Pemeriksa</th>
                <th>Status</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.inspeksi_terbaru?.slice(0, 5).map((inspeksi) => (
                <tr key={inspeksi.id}>
                  <td>{new Date(inspeksi.tarikh_inspeksi).toLocaleDateString('ms-MY')}</td>
                  <td className="font-medium">{inspeksi.tree?.tag_no}</td>
                  <td>{inspeksi.pemeriksa}</td>
                  <td>
                    <span
                      className={`badge ${
                        inspeksi.status === 'sihat'
                          ? 'badge-success'
                          : inspeksi.status === 'sederhana'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {inspeksi.status}
                    </span>
                  </td>
                  <td className="text-sm text-gray-600">
                    {inspeksi.tindakan || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
