import { useState, useEffect } from 'react';
import { Filter, MapPin, Leaf } from 'lucide-react';
import FarmMap from '../components/FarmMap';
import api from '../utils/api';

const FarmMapPage = () => {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVarieti, setFilterVarieti] = useState('');
  const [varieties, setVarieties] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    sihat: 0,
    sederhana: 0,
    kurang_sihat: 0,
    kritikal: 0,
  });

  useEffect(() => {
    fetchStatistics();
    fetchVarieties();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/pokok-statistics');
      setStatistics({
        total: response.data.data.total_pokok || 0,
        sihat: response.data.data.pokok_sihat || 0,
        kritikal: response.data.data.pokok_kritikal || 0,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchVarieties = async () => {
    try {
      const response = await api.get('/pokok-statistics');
      const varietiData = response.data.data.by_varieti || [];
      setVarieties(varietiData.map(v => v.varieti));
    } catch (error) {
      console.error('Error fetching varieties:', error);
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterVarieti('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peta Kebun</h1>
          <p className="text-gray-600">Visualisasi lokasi pokok dengan koordinat GPS</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Jumlah Pokok</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Leaf className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sihat</p>
              <p className="text-2xl font-bold text-green-600">{statistics.sihat}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-green-500"></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sederhana</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statistics.total - statistics.sihat - statistics.kritikal}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kritikal</p>
              <p className="text-2xl font-bold text-red-600">{statistics.kritikal}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-red-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter Peta</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Status Kesihatan</label>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="sihat">Sihat</option>
              <option value="sederhana">Sederhana</option>
              <option value="kurang sihat">Kurang Sihat</option>
              <option value="kritikal">Kritikal</option>
            </select>
          </div>

          <div>
            <label className="label">Varieti</label>
            <select
              className="input-field"
              value={filterVarieti}
              onChange={(e) => setFilterVarieti(e.target.value)}
            >
              <option value="">Semua Varieti</option>
              {varieties.map((varieti, index) => (
                <option key={index} value={varieti}>
                  {varieti}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn-secondary w-full"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {(filterStatus || filterVarieti) && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Filter aktif:</span>{' '}
              {filterStatus && `Status: ${filterStatus}`}
              {filterStatus && filterVarieti && ' | '}
              {filterVarieti && `Varieti: ${filterVarieti}`}
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Peta Interaktif</h3>
        </div>

        <FarmMap filterStatus={filterStatus} />

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm text-gray-900 mb-2">Cara Penggunaan:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Klik pada marker</strong> untuk melihat maklumat pokok</li>
            <li>• <strong>Zoom in/out</strong> menggunakan butang + / - atau scroll mouse</li>
            <li>• <strong>Drag peta</strong> untuk menggerakkan paparan</li>
            <li>• <strong>Warna marker</strong> menunjukkan status kesihatan pokok</li>
            <li>• Gunakan filter di atas untuk menapis paparan mengikut status atau varieti</li>
          </ul>
        </div>
      </div>

      {/* Info Box */}
      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-200 rounded-lg">
            <MapPin className="text-primary-700" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-primary-900 mb-1">
              Tambah Koordinat GPS
            </h3>
            <p className="text-sm text-primary-800">
              Untuk melihat pokok pada peta, tambahkan koordinat GPS semasa menambah atau mengedit pokok.
              Gunakan butang "Ambil Lokasi GPS" untuk mendapatkan koordinat semasa secara automatik dari peranti anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmMapPage;
