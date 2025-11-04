import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Mountain, TreeDeciduous, TrendingUp, MapPin, ChevronRight } from 'lucide-react';

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/zones');
      setZones(response.data.data);
    } catch (error) {
      console.error('Error fetching zones:', error);
      alert('Error loading zones data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      baik: 'bg-green-100 text-green-800',
      perlu_repair: 'bg-yellow-100 text-yellow-800',
      perlu_naik_tanah: 'bg-orange-100 text-orange-800',
      baru_buat: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mountain className="text-primary-600" size={28} />
            Kawasan Busut
          </h1>
          <p className="text-gray-600">Pengurusan kawasan dan busut tanah</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Busut</p>
              <h3 className="text-3xl font-bold text-primary-900">
                {zones.reduce((sum, zone) => sum + zone.total_busut, 0)}
              </h3>
            </div>
            <Mountain size={48} className="text-primary-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pokok</p>
              <h3 className="text-3xl font-bold text-green-900">
                {zones.reduce((sum, zone) => sum + (zone.total_pokok || 0), 0)}
              </h3>
            </div>
            <TreeDeciduous size={48} className="text-green-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Area</p>
              <h3 className="text-3xl font-bold text-blue-900">
                {zones.reduce((sum, zone) => sum + (parseFloat(zone.total_area_hectares) || 0), 0).toFixed(1)}
              </h3>
              <p className="text-xs text-blue-700">hektar</p>
            </div>
            <TrendingUp size={48} className="text-blue-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Zones List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/busut?zone=${zone.id}`)}
          >
            {/* Zone Header */}
            <div
              className="flex items-center justify-between mb-4 pb-4 border-b-4"
              style={{ borderColor: zone.color_code || '#10B981' }}
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{zone.name}</h2>
                <p className="text-sm text-gray-600">{zone.code}</p>
              </div>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: zone.color_code + '20' }}
              >
                <Mountain size={32} style={{ color: zone.color_code }} />
              </div>
            </div>

            {/* Zone Description */}
            {zone.description && (
              <p className="text-gray-600 mb-4">{zone.description}</p>
            )}

            {/* Zone Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{zone.total_busut}</p>
                <p className="text-xs text-gray-600">Busut</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{zone.total_pokok || 0}</p>
                <p className="text-xs text-gray-600">Pokok</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {parseFloat(zone.total_area_hectares).toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">Hektar</p>
              </div>
            </div>

            {/* Busut Status Breakdown */}
            {zone.statistics?.busut_status && (
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700">Status Busut:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(zone.statistics.busut_status).map(([status, count]) => (
                    <span
                      key={status}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                    >
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* View Details Button */}
            <button
              className="w-full btn-secondary flex items-center justify-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/busut?zone=${zone.id}`);
              }}
            >
              <MapPin size={18} />
              Lihat Busut di {zone.name}
              <ChevronRight size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {zones.length === 0 && (
        <div className="card text-center py-12">
          <Mountain size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tiada Kawasan</h3>
          <p className="text-gray-600">Belum ada kawasan yang didaftarkan</p>
        </div>
      )}
    </div>
  );
};

export default Zones;
