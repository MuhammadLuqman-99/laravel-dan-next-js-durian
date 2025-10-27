import { useState, useEffect } from 'react';
import api from '../utils/api';
import { TreeDeciduous, TrendingUp, AlertTriangle, CheckCircle, Droplet, Clock, AlertOctagon, Cloud, DollarSign, ShoppingCart, PlusCircle, Leaf, Scale } from 'lucide-react';
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
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Ringkasan aktiviti kebun anda</p>
      </div>

      {/* Section 1: OVERVIEW CARDS - Pokok Stats & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* Section 2: QUICK ACTIONS */}
      <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PlusCircle className="text-primary-600" size={24} />
          Tindakan Pantas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/pokok"
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-primary-50 rounded-lg transition-all shadow-sm hover:shadow-md group"
          >
            <TreeDeciduous className="text-primary-600 mb-2 group-hover:scale-110 transition-transform" size={28} />
            <span className="text-sm font-medium text-gray-700">Tambah Tanaman</span>
          </Link>
          <Link
            to="/hasil"
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-green-50 rounded-lg transition-all shadow-sm hover:shadow-md group"
          >
            <TrendingUp className="text-green-600 mb-2 group-hover:scale-110 transition-transform" size={28} />
            <span className="text-sm font-medium text-gray-700">Rekod Hasil</span>
          </Link>
          <Link
            to="/sales"
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50 rounded-lg transition-all shadow-sm hover:shadow-md group"
          >
            <ShoppingCart className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" size={28} />
            <span className="text-sm font-medium text-gray-700">Rekod Jualan</span>
          </Link>
          <Link
            to="/expenses"
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-orange-50 rounded-lg transition-all shadow-sm hover:shadow-md group"
          >
            <DollarSign className="text-orange-600 mb-2 group-hover:scale-110 transition-transform" size={28} />
            <span className="text-sm font-medium text-gray-700">Rekod Belanja</span>
          </Link>
        </div>
      </div>

      {/* Section 3: ALERTS - Spray Overdue & Due Soon */}
      {(stats?.spray_overdue?.length > 0 || stats?.spray_due_soon?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats?.spray_overdue?.length > 0 && (
            <div className="card border-l-4 border-red-500 bg-red-50">
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
                    <div key={spray.id} className="p-3 bg-white rounded-lg border border-red-200">
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

          {stats?.spray_due_soon?.length > 0 && (
            <div className="card border-l-4 border-yellow-500 bg-yellow-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="text-yellow-600" size={24} />
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
                    <div key={spray.id} className="p-3 bg-white rounded-lg border border-yellow-200">
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

      {/* Section 4: FINANCIAL OVERVIEW - Profit/Loss Summary */}
      {stats?.profit_loss && (
        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Scale className="text-purple-600" size={24} />
            Ringkasan Kewangan (Untung Rugi)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* This Month */}
            <div>
              <h4 className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wide">Bulan Ini</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600">Hasil Jualan</span>
                  <span className="font-semibold text-green-600">
                    RM {parseFloat(stats.profit_loss.revenue_bulan_ini || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600">Perbelanjaan</span>
                  <span className="font-semibold text-red-600">
                    RM {parseFloat(stats.profit_loss.expenses_bulan_ini || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md">
                  <span className="text-sm font-bold">UNTUNG/RUGI</span>
                  <span className="font-bold text-xl">
                    RM {parseFloat(stats.profit_loss.profit_bulan_ini || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* This Year */}
            <div>
              <h4 className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wide">Tahun Ini</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600">Hasil Jualan</span>
                  <span className="font-semibold text-green-600">
                    RM {parseFloat(stats.profit_loss.revenue_tahun_ini || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-sm text-gray-600">Perbelanjaan</span>
                  <span className="font-semibold text-red-600">
                    RM {parseFloat(stats.profit_loss.expenses_tahun_ini || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md">
                  <span className="text-sm font-bold">UNTUNG/RUGI</span>
                  <span className="font-bold text-xl">
                    RM {parseFloat(stats.profit_loss.profit_tahun_ini || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: DETAILED STATS - Sales & Expenses Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Details */}
        {stats?.sales && (
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="text-blue-600" size={24} />
              Jualan
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Jualan Bulan Ini</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-blue-600">
                    RM {parseFloat(stats.sales.total_bulan_ini || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {parseFloat(stats.sales.berat_bulan_ini || 0).toFixed(1)} kg
                  </p>
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Jualan Tahun Ini</p>
                <p className="text-2xl font-bold text-indigo-600">
                  RM {parseFloat(stats.sales.total_tahun_ini || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Mengikut Gred</p>
                  <Link to="/sales" className="text-xs text-blue-600 hover:text-blue-700">
                    Lihat →
                  </Link>
                </div>
                <div className="space-y-1">
                  {stats.sales.by_gred?.slice(0, 3).map((item) => (
                    <div key={item.gred} className="flex justify-between items-center py-1">
                      <span className="text-xs font-medium text-gray-600">Gred {item.gred}</span>
                      <span className="text-xs font-semibold text-blue-600">
                        RM {parseFloat(item.total).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {(!stats.sales.by_gred || stats.sales.by_gred.length === 0) && (
                    <p className="text-xs text-gray-400 text-center py-2">Tiada jualan lagi</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Details */}
        {stats?.expenses && (
          <div className="card bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="text-orange-600" size={24} />
              Perbelanjaan
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Perbelanjaan Bulan Ini</p>
                <p className="text-2xl font-bold text-orange-600">
                  RM {parseFloat(stats.expenses.total_bulan_ini || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Perbelanjaan Tahun Ini</p>
                <p className="text-2xl font-bold text-red-600">
                  RM {parseFloat(stats.expenses.total_tahun_ini || 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">Kos Tertinggi</p>
                  <Link to="/expenses" className="text-xs text-orange-600 hover:text-orange-700">
                    Lihat →
                  </Link>
                </div>
                <div className="space-y-1">
                  {stats.expenses.by_kategori?.slice(0, 3).map((item) => (
                    <div key={item.kategori} className="flex justify-between items-center py-1">
                      <span className="text-xs font-medium text-gray-600 capitalize">{item.kategori}</span>
                      <span className="text-xs font-semibold text-orange-600">
                        RM {parseFloat(item.total).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 6: TREE ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Leaf className="text-green-600" size={24} />
            Status Kesihatan Pokok
          </h3>
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
                    <span className="capitalize font-medium">{item.status_kesihatan}</span>
                    <span className="font-semibold">{item.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${colors[item.status_kesihatan]} h-3 rounded-full transition-all shadow-sm`}
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
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="text-primary-600" size={24} />
            Top 5 Pokok Produktif
          </h3>
          <div className="space-y-2">
            {stats?.top_trees?.map((item, index) => (
              <div key={item.tree_id} className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-green-50 rounded-lg border border-primary-100">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-primary-500 text-white rounded-full font-bold text-sm shadow-md">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.tree?.tag_no}</p>
                    <p className="text-xs text-gray-500">{item.tree?.varieti}</p>
                  </div>
                </div>
                <span className="font-bold text-primary-600 text-lg">
                  {item.total_berat?.toFixed(1)} kg
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 7: RECENT ACTIVITY */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="text-gray-600" size={24} />
          Inspeksi Terbaru
        </h3>
        <div className="overflow-x-auto">
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
                <tr key={inspeksi.id} className="hover:bg-gray-50">
                  <td className="text-sm">{new Date(inspeksi.tarikh_inspeksi).toLocaleDateString('ms-MY')}</td>
                  <td className="font-medium">{inspeksi.tree?.tag_no}</td>
                  <td className="text-sm">{inspeksi.pemeriksa}</td>
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
