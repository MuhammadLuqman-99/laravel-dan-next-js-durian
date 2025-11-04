import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Mountain, Search, Filter, MapPin, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const Busut = () => {
  const [busutList, setBusutList] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState(searchParams.get('zone') || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchZones();
    fetchBusut();
  }, [selectedZone, selectedStatus, searchQuery, currentPage]);

  const fetchZones = async () => {
    try {
      const response = await api.get('/zones');
      setZones(response.data.data);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchBusut = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        ...(selectedZone && { zone_id: selectedZone }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await api.get('/busut', { params });
      setBusutList(response.data.data.data);
      setTotalPages(response.data.data.last_page);
    } catch (error) {
      console.error('Error fetching busut:', error);
      alert('Error loading busut data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      baik: 'bg-green-100 text-green-800 border-green-300',
      perlu_repair: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      perlu_naik_tanah: 'bg-orange-100 text-orange-800 border-orange-300',
      baru_buat: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    if (status === 'baik') return <CheckCircle size={16} />;
    return <AlertCircle size={16} />;
  };

  const getUtilizationColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleZoneFilter = (e) => {
    setSelectedZone(e.target.value);
    setCurrentPage(1);
    if (e.target.value) {
      setSearchParams({ zone: e.target.value });
    } else {
      setSearchParams({});
    }
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedZone('');
    setSelectedStatus('');
    setCurrentPage(1);
    setSearchParams({});
  };

  if (loading && busutList.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mountain className="text-primary-600" size={28} />
            Senarai Busut
          </h1>
          <p className="text-gray-600">
            {busutList.length > 0 ? `Menunjukkan ${busutList.length} busut` : 'Tiada busut'}
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => navigate('/zones')}
        >
          <MapPin size={18} />
          Lihat Kawasan
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Penapis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kod busut..."
              value={searchQuery}
              onChange={handleSearch}
              className="input-field pl-10"
            />
          </div>

          {/* Zone Filter */}
          <select
            value={selectedZone}
            onChange={handleZoneFilter}
            className="input-field"
          >
            <option value="">Semua Kawasan</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.code})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={handleStatusFilter}
            className="input-field"
          >
            <option value="">Semua Status</option>
            <option value="baik">Baik</option>
            <option value="perlu_repair">Perlu Repair</option>
            <option value="perlu_naik_tanah">Perlu Naik Tanah</option>
            <option value="baru_buat">Baru Buat</option>
          </select>

          {/* Reset Button */}
          <button onClick={resetFilters} className="btn-secondary">
            Reset Penapis
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kod Busut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kawasan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dimensi (m)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kapasiti
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Penggunaan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {busutList.map((busut) => (
              <tr
                key={busut.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/busut/${busut.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Mountain
                      size={20}
                      className="mr-2"
                      style={{ color: busut.zone?.color_code }}
                    />
                    <span className="font-medium text-gray-900">{busut.busut_code}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{busut.zone?.name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {busut.panjang}m × {busut.lebar}m × {busut.tinggi}m
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {busut.current_trees} / {busut.capacity_trees} pokok
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${busut.utilization_percentage}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${getUtilizationColor(busut.utilization_percentage)}`}>
                      {busut.utilization_percentage}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(busut.status)}`}>
                    {getStatusIcon(busut.status)}
                    {busut.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/busut/${busut.id}`);
                    }}
                    className="text-primary-600 hover:text-primary-900 font-medium"
                  >
                    Lihat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {busutList.map((busut) => (
          <div
            key={busut.id}
            className="card cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/busut/${busut.id}`)}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between mb-3 pb-3 border-b-2"
              style={{ borderColor: busut.zone?.color_code || '#10B981' }}
            >
              <div className="flex items-center gap-2">
                <Mountain size={24} style={{ color: busut.zone?.color_code }} />
                <div>
                  <h3 className="font-bold text-gray-900">{busut.busut_code}</h3>
                  <p className="text-xs text-gray-600">{busut.zone?.name}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(busut.status)}`}>
                {getStatusIcon(busut.status)}
                {busut.status}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs text-gray-600">Dimensi</p>
                <p className="text-sm font-medium text-gray-900">
                  {busut.panjang}m × {busut.lebar}m
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Kapasiti</p>
                <p className="text-sm font-medium text-gray-900">
                  {busut.current_trees} / {busut.capacity_trees} pokok
                </p>
              </div>
            </div>

            {/* Utilization Bar */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-600">Penggunaan</p>
                <span className={`text-xs font-medium ${getUtilizationColor(busut.utilization_percentage)}`}>
                  {busut.utilization_percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${busut.utilization_percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {busutList.length === 0 && !loading && (
        <div className="card text-center py-12">
          <Mountain size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tiada Busut Dijumpai</h3>
          <p className="text-gray-600 mb-4">Cuba ubah penapis atau tambah busut baru</p>
          <button onClick={resetFilters} className="btn-secondary">
            Reset Penapis
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelum
          </button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Halaman {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Seterusnya
          </button>
        </div>
      )}
    </div>
  );
};

export default Busut;
