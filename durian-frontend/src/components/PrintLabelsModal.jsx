import { useState } from 'react';
import { X, Printer, Check } from 'lucide-react';
import api from '../utils/api';

const PrintLabelsModal = ({ isOpen, onClose, selectedTrees = [], mode = 'single', treeId = null }) => {
  const [printing, setPrinting] = useState(false);
  const [options, setOptions] = useState({
    size: 'medium',
    includeQR: true,
    columns: 3,
    rows: 5,
  });

  if (!isOpen) return null;

  const handlePrint = async () => {
    try {
      setPrinting(true);

      let url = '';
      let params = {};

      if (mode === 'single' && treeId) {
        // Single label
        url = `/pokok/${treeId}/print-label`;
        params = {
          size: options.size,
          include_qr: options.includeQR,
        };
      } else if (mode === 'batch' && selectedTrees.length > 0) {
        // Batch labels
        url = '/pokok/print-batch-labels';
        params = {
          tree_ids: selectedTrees,
          include_qr: options.includeQR,
          columns: options.columns,
          rows: options.rows,
        };
      } else if (mode === 'all') {
        // All labels
        url = '/pokok-print-all-labels';
        params = {
          include_qr: options.includeQR,
          columns: options.columns,
          rows: options.rows,
        };
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
      link.download = `labels-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (error) {
      console.error('Error printing labels:', error);
      alert('Failed to print labels');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Printer size={24} className="text-primary-600" />
            Print Labels
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              {mode === 'single' && 'Printing label for 1 tree'}
              {mode === 'batch' && `Printing labels for ${selectedTrees.length} selected trees`}
              {mode === 'all' && 'Printing labels for all trees'}
            </p>
          </div>

          {/* Label Size (Single only) */}
          {mode === 'single' && (
            <div>
              <label className="label">Label Size</label>
              <select
                className="input-field"
                value={options.size}
                onChange={(e) => setOptions({ ...options, size: e.target.value })}
              >
                <option value="small">Small (70mm x 50mm)</option>
                <option value="medium">Medium (100mm x 70mm)</option>
                <option value="large">Large (148mm x 105mm - A6)</option>
              </select>
            </div>
          )}

          {/* Grid Layout (Batch/All) */}
          {(mode === 'batch' || mode === 'all') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Columns</label>
                <select
                  className="input-field"
                  value={options.columns}
                  onChange={(e) => setOptions({ ...options, columns: parseInt(e.target.value) })}
                >
                  <option value="2">2 Columns</option>
                  <option value="3">3 Columns</option>
                  <option value="4">4 Columns</option>
                </select>
              </div>
              <div>
                <label className="label">Rows per page</label>
                <select
                  className="input-field"
                  value={options.rows}
                  onChange={(e) => setOptions({ ...options, rows: parseInt(e.target.value) })}
                >
                  <option value="3">3 Rows</option>
                  <option value="4">4 Rows</option>
                  <option value="5">5 Rows</option>
                  <option value="6">6 Rows</option>
                </select>
              </div>
            </div>
          )}

          {/* Include QR Code */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="includeQR"
              checked={options.includeQR}
              onChange={(e) => setOptions({ ...options, includeQR: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="includeQR" className="text-sm text-gray-700 cursor-pointer">
              Include QR Code on labels
            </label>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Tips:</strong>
              <br />
              • Use waterproof label paper for outdoor use
              <br />
              • QR codes allow quick scanning to view tree details
              <br />
              • Recommended: Print without QR for faster batch printing
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={printing}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handlePrint}
              disabled={printing}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {printing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Printer size={18} />
                  Print Labels
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintLabelsModal;
