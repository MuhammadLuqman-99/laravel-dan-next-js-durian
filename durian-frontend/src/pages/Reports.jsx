import { useState } from 'react';
import api from '../utils/api';
import { FileText, Download, Calendar, TrendingUp, FileSpreadsheet, FileDown } from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('monthly');

  // For monthly/yearly reports
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // For profit/loss statement
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Mac' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Julai' },
    { value: 8, label: 'Ogos' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Disember' },
  ];

  const downloadPDF = async (type) => {
    try {
      setLoading(true);
      let url = '';
      let params = {};

      if (type === 'monthly') {
        url = '/reports/monthly/pdf';
        params = { year, month };
      } else if (type === 'yearly') {
        url = '/reports/yearly/pdf';
        params = { year };
      } else if (type === 'profit-loss') {
        url = '/reports/profit-loss/pdf';
        params = { start_date: startDate, end_date: endDate };
      }

      const response = await api.get(url, {
        params,
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Laporan-${type}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Gagal memuat turun laporan PDF');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = async (type) => {
    try {
      setLoading(true);
      let url = '';
      let params = {};

      switch (type) {
        case 'pokok':
          url = '/export/pokok';
          break;
        case 'hasil':
          url = '/export/hasil';
          params = { start_date: startDate, end_date: endDate };
          break;
        case 'sales':
          url = '/export/sales';
          params = { start_date: startDate, end_date: endDate };
          break;
        case 'expenses':
          url = '/export/expenses';
          params = { start_date: startDate, end_date: endDate };
          break;
        case 'all':
          url = '/export/all';
          params = { start_date: startDate, end_date: endDate };
          break;
        default:
          return;
      }

      const response = await api.get(url, {
        params,
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `Export-${type}-${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Gagal memuat turun Excel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="text-primary-600" size={28} />
          Laporan & Export
        </h1>
        <p className="text-gray-600">Muat turun laporan dan export data</p>
      </div>

      {/* PDF Reports Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileDown className="text-red-600" size={24} />
          Laporan PDF
        </h2>

        {/* Report Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Laporan
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="input"
          >
            <option value="monthly">Laporan Bulanan</option>
            <option value="yearly">Laporan Tahunan</option>
            <option value="profit-loss">Penyata Untung Rugi</option>
          </select>
        </div>

        {/* Monthly Report Form */}
        {reportType === 'monthly' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="input"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulan
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="input"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => downloadPDF('monthly')}
              disabled={loading}
              className="btn-primary w-full md:w-auto"
            >
              <Download size={18} className="mr-2" />
              {loading ? 'Memuat turun...' : 'Muat Turun Laporan Bulanan'}
            </button>
          </div>
        )}

        {/* Yearly Report Form */}
        {reportType === 'yearly' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => downloadPDF('yearly')}
              disabled={loading}
              className="btn-primary w-full md:w-auto"
            >
              <Download size={18} className="mr-2" />
              {loading ? 'Memuat turun...' : 'Muat Turun Laporan Tahunan'}
            </button>
          </div>
        )}

        {/* Profit/Loss Statement Form */}
        {reportType === 'profit-loss' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarikh Mula
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarikh Akhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                  required
                />
              </div>
            </div>
            <button
              onClick={() => downloadPDF('profit-loss')}
              disabled={loading || !startDate || !endDate}
              className="btn-primary w-full md:w-auto"
            >
              <Download size={18} className="mr-2" />
              {loading ? 'Memuat turun...' : 'Muat Turun Penyata Untung Rugi'}
            </button>
          </div>
        )}
      </div>

      {/* Excel Exports Section */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileSpreadsheet className="text-green-600" size={24} />
          Export Excel
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Export data ke format Excel untuk analisis lanjut
        </p>

        {/* Date Range Filter (Optional) */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Tapis Mengikut Tarikh (Pilihan)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarikh Mula
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarikh Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            * Kosongkan tarikh untuk export semua data
          </p>
        </div>

        {/* Export Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => downloadExcel('pokok')}
            disabled={loading}
            className="btn-secondary flex items-center justify-center"
          >
            <FileSpreadsheet size={18} className="mr-2" />
            Export Tanaman
          </button>

          <button
            onClick={() => downloadExcel('hasil')}
            disabled={loading}
            className="btn-secondary flex items-center justify-center"
          >
            <FileSpreadsheet size={18} className="mr-2" />
            Export Hasil
          </button>

          <button
            onClick={() => downloadExcel('sales')}
            disabled={loading}
            className="btn-secondary flex items-center justify-center"
          >
            <FileSpreadsheet size={18} className="mr-2" />
            Export Jualan
          </button>

          <button
            onClick={() => downloadExcel('expenses')}
            disabled={loading}
            className="btn-secondary flex items-center justify-center"
          >
            <FileSpreadsheet size={18} className="mr-2" />
            Export Perbelanjaan
          </button>

          <button
            onClick={() => downloadExcel('all')}
            disabled={loading}
            className="btn-primary flex items-center justify-center md:col-span-2"
          >
            <FileSpreadsheet size={18} className="mr-2" />
            Export Semua Data
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Tips Penggunaan</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Laporan PDF sesuai untuk documentation dan presentation</li>
              <li>• Export Excel sesuai untuk analisis data dengan formula</li>
              <li>• Gunakan date range filter untuk export data specific period</li>
              <li>• "Export Semua Data" akan create multi-sheet Excel file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
