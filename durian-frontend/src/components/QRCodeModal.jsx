import { X, Printer, Download } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, pokokId, tagNo }) => {
  if (!isOpen) return null;

  const qrCodeUrl = `http://localhost:8000/api/pokok/${pokokId}/qrcode`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${tagNo}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              padding: 20px;
            }
            h1 {
              margin-bottom: 10px;
              font-size: 24px;
            }
            .tag {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #2d5016;
            }
            img {
              max-width: 300px;
              border: 2px solid #000;
              padding: 10px;
            }
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Pokok Durian</h1>
            <div class="tag">${tagNo}</div>
            <img src="${qrCodeUrl}" alt="QR Code ${tagNo}" />
            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Scan untuk lihat maklumat pokok
            </p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QRCode-${tagNo}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            QR Code - {tagNo}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* QR Code Display */}
        <div className="p-6">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 flex justify-center">
            <img
              src={qrCodeUrl}
              alt={`QR Code ${tagNo}`}
              className="w-64 h-64"
            />
          </div>
          <p className="text-center text-gray-600 mt-4 text-sm">
            Scan QR code ini untuk lihat maklumat pokok
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handlePrint}
            className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
          >
            <Printer size={20} />
            Print
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 btn btn-primary flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
