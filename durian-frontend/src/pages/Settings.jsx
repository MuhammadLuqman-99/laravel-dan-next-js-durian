import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Settings as SettingsIcon, Save } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [presets, setPresets] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, presetsRes] = await Promise.all([
        api.get('/farm-settings'),
        api.get('/farm-settings/crop-presets'),
      ]);
      setSettings(settingsRes.data.data);
      setPresets(presetsRes.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('Error loading settings. Make sure backend is running!');
      // Set default values if API fails
      setSettings({
        farm_name: 'Kebun Durian',
        crop_type: 'durian',
        crop_label_singular: 'Pokok Durian',
        crop_label_plural: 'Pokok Durian',
        unit_weight: 'kg',
        unit_quantity: 'biji',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/farm-settings', settings);
      alert('Tetapan berjaya dikemaskini! Refresh page untuk lihat perubahan.');
      window.location.reload(); // Reload to update all labels
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (cropType) => {
    const preset = presets[cropType];
    if (preset) {
      setSettings({ ...settings, ...preset, farm_name: `Kebun ${preset.crop_label_singular}` });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tetapan Kebun</h1>
        <p className="text-gray-600">Konfigurasi jenis tanaman & tetapan sistem</p>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Pilih Jenis Tanaman (Quick Setup)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.keys(presets).map((crop) => (
            <button
              key={crop}
              onClick={() => applyPreset(crop)}
              className={`p-3 border-2 rounded-lg hover:bg-primary-50 hover:border-primary-500 transition-colors ${
                settings.crop_type === crop ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              }`}
            >
              <div className="text-sm font-medium capitalize">{crop.replace('_', ' ')}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Maklumat Kebun</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nama Kebun</label>
              <input type="text" className="input-field" value={settings.farm_name} onChange={(e) => setSettings({ ...settings, farm_name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Nama Pemilik</label>
              <input type="text" className="input-field" value={settings.owner_name || ''} onChange={(e) => setSettings({ ...settings, owner_name: e.target.value })} />
            </div>
            <div>
              <label className="label">No. Telefon</label>
              <input type="text" className="input-field" value={settings.contact_number || ''} onChange={(e) => setSettings({ ...settings, contact_number: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Alamat</label>
              <textarea className="input-field" rows="2" value={settings.address || ''} onChange={(e) => setSettings({ ...settings, address: e.target.value })}></textarea>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Tetapan Tanaman</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Jenis Tanaman</label>
              <input type="text" className="input-field" value={settings.crop_type} onChange={(e) => setSettings({ ...settings, crop_type: e.target.value })} required />
              <p className="text-xs text-gray-500 mt-1">Contoh: durian, pisang, rambutan</p>
            </div>
            <div>
              <label className="label">Label (Singular)</label>
              <input type="text" className="input-field" value={settings.crop_label_singular} onChange={(e) => setSettings({ ...settings, crop_label_singular: e.target.value })} required />
              <p className="text-xs text-gray-500 mt-1">Contoh: Pokok Durian, Tanaman Sayur</p>
            </div>
            <div>
              <label className="label">Label (Plural)</label>
              <input type="text" className="input-field" value={settings.crop_label_plural} onChange={(e) => setSettings({ ...settings, crop_label_plural: e.target.value })} required />
              <p className="text-xs text-gray-500 mt-1">Contoh: Pokok Durian, Tanaman-tanaman</p>
            </div>
            <div>
              <label className="label">Unit Berat</label>
              <input type="text" className="input-field" value={settings.unit_weight} onChange={(e) => setSettings({ ...settings, unit_weight: e.target.value })} required />
              <p className="text-xs text-gray-500 mt-1">Contoh: kg, tan, guni</p>
            </div>
            <div>
              <label className="label">Unit Kuantiti</label>
              <input type="text" className="input-field" value={settings.unit_quantity} onChange={(e) => setSettings({ ...settings, unit_quantity: e.target.value })} required />
              <p className="text-xs text-gray-500 mt-1">Contoh: biji, tandan, ikat</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={20} />
            {saving ? 'Menyimpan...' : 'Simpan Tetapan'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
