import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  Mountain,
  ArrowLeft,
  MapPin,
  Ruler,
  TreeDeciduous,
  Activity,
  Beaker,
  Calendar,
  DollarSign,
  Edit,
  Plus,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const BusutDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [busut, setBusut] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchBusutDetails();
  }, [id]);

  const fetchBusutDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/busut/${id}`);
      setBusut(response.data.data);
    } catch (error) {
      console.error('Error fetching busut details:', error);
      alert('Error loading busut details');
      navigate('/busut');
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
    if (status === 'baik') return <CheckCircle size={20} />;
    return <AlertCircle size={20} />;
  };

  const getUtilizationColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMaintenanceTypeLabel = (type) => {
    const labels = {
      soil_test: 'Ujian Tanah',
      naik_tanah: 'Naik Tanah',
      repair_erosion: 'Repair Hakisan',
      fertilization: 'Baja',
      drainage_check: 'Cek Saliran',
      other: 'Lain-lain',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ms-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!busut) return null;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/busut')}
          className="btn-secondary flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Kembali
        </button>
        <button
          onClick={() => navigate(`/busut/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit size={18} />
          Edit Busut
        </button>
      </div>

      {/* Busut Header Card */}
      <div className="card">
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b-4"
          style={{ borderColor: busut.zone?.color_code || '#10B981' }}
        >
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: busut.zone?.color_code + '20' }}
            >
              <Mountain size={32} style={{ color: busut.zone?.color_code }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{busut.busut_code}</h1>
              <p className="text-gray-600">
                {busut.zone?.name} ({busut.zone?.code})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(busut.status)}`}>
              {getStatusIcon(busut.status)}
              {busut.status}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600">{busut.current_trees}</p>
            <p className="text-sm text-gray-600">Pokok Semasa</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{busut.capacity_trees}</p>
            <p className="text-sm text-gray-600">Kapasiti</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{busut.available_space}</p>
            <p className="text-sm text-gray-600">Ruang Kosong</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{busut.utilization_percentage}%</p>
            <p className="text-sm text-gray-600">Penggunaan</p>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${getUtilizationColor(busut.utilization_percentage)}`}
              style={{ width: `${busut.utilization_percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Ruler size={18} className="inline mr-2" />
            Maklumat
          </button>
          <button
            onClick={() => setActiveTab('pokok')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'pokok'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TreeDeciduous size={18} className="inline mr-2" />
            Pokok ({busut.pokok?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Activity size={18} className="inline mr-2" />
            Maintenance ({busut.maintenance_records?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dimensions Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Ruler className="text-primary-600" />
              Dimensi Busut
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Panjang</span>
                <span className="font-medium">{busut.panjang} meter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lebar</span>
                <span className="font-medium">{busut.lebar} meter</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tinggi</span>
                <span className="font-medium">{busut.tinggi} meter</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Luas (anggaran)</span>
                <span className="font-medium">{(busut.panjang * busut.lebar).toFixed(2)} m²</span>
              </div>
            </div>
          </div>

          {/* GPS Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="text-primary-600" />
              Lokasi GPS
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Latitude</span>
                <span className="font-medium">{busut.latitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Longitude</span>
                <span className="font-medium">{busut.longitude}</span>
              </div>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${busut.latitude},${busut.longitude}`,
                    '_blank'
                  )
                }
                className="btn-secondary w-full mt-4"
              >
                <MapPin size={16} className="inline mr-2" />
                Buka di Google Maps
              </button>
            </div>
          </div>

          {/* Soil Information Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Beaker className="text-primary-600" />
              Maklumat Tanah
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Jenis Tanah</span>
                <span className="font-medium">{busut.soil_type || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">pH Tanah</span>
                <span className="font-medium">{busut.soil_ph || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ujian Tanah Terakhir</span>
                <span className="font-medium">{formatDate(busut.last_soil_test)}</span>
              </div>
            </div>
          </div>

          {/* Maintenance Info Card */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="text-primary-600" />
              Maklumat Maintenance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tarikh Dibuat</span>
                <span className="font-medium">{formatDate(busut.date_created)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maintenance Terakhir</span>
                <span className="font-medium">{formatDate(busut.last_maintenance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(busut.status)}`}>
                  {busut.status}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {busut.notes && (
            <div className="card md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Catatan</h3>
              <p className="text-gray-700">{busut.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pokok' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Senarai Pokok di Busut Ini</h3>
            <button className="btn-primary flex items-center gap-2" onClick={() => alert('Feature coming soon!')}>
              <Plus size={18} />
              Tambah Pokok
            </button>
          </div>

          {busut.pokok && busut.pokok.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tag No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varieti</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Umur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posisi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {busut.pokok.map((pokok) => (
                    <tr
                      key={pokok.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/pokok/${pokok.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{pokok.tag_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{pokok.varieti}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{pokok.umur} tahun</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {pokok.status_kesihatan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {pokok.position_in_busut || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <TreeDeciduous size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tiada Pokok</h3>
              <p className="text-gray-600 mb-4">Belum ada pokok ditanam di busut ini</p>
              <button className="btn-primary" onClick={() => alert('Feature coming soon!')}>
                <Plus size={18} className="inline mr-2" />
                Tambah Pokok
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Rekod Maintenance</h3>
            <button
              className="btn-primary flex items-center gap-2"
              onClick={() => navigate(`/busut/${id}/maintenance/new`)}
            >
              <Plus size={18} />
              Tambah Rekod
            </button>
          </div>

          {busut.maintenance_records && busut.maintenance_records.length > 0 ? (
            <div className="space-y-4">
              {busut.maintenance_records.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{getMaintenanceTypeLabel(record.maintenance_type)}</h4>
                      <p className="text-sm text-gray-600">{formatDate(record.tarikh)}</p>
                    </div>
                    {record.cost && (
                      <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                        <DollarSign size={18} />
                        RM {parseFloat(record.cost).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {record.maintenance_type === 'soil_test' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-gray-50 rounded">
                      <div>
                        <p className="text-xs text-gray-600">pH Level</p>
                        <p className="font-medium">{record.ph_level || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Nitrogen</p>
                        <p className="font-medium">{record.nitrogen || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Phosphorus</p>
                        <p className="font-medium">{record.phosphorus || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Potassium</p>
                        <p className="font-medium">{record.potassium || '-'}</p>
                      </div>
                    </div>
                  )}

                  {record.findings && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Penemuan:</p>
                      <p className="text-sm text-gray-600">{record.findings}</p>
                    </div>
                  )}

                  {record.actions_taken && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Tindakan:</p>
                      <p className="text-sm text-gray-600">{record.actions_taken}</p>
                    </div>
                  )}

                  {record.recommendations && (
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-900">Cadangan:</p>
                      <p className="text-sm text-blue-800">{record.recommendations}</p>
                    </div>
                  )}

                  {record.user && (
                    <p className="text-xs text-gray-500 mt-3">Oleh: {record.user.name}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tiada Rekod Maintenance</h3>
              <p className="text-gray-600 mb-4">Belum ada rekod maintenance untuk busut ini</p>
              <button
                className="btn-primary"
                onClick={() => navigate(`/busut/${id}/maintenance/new`)}
              >
                <Plus size={18} className="inline mr-2" />
                Tambah Rekod
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusutDetails;
