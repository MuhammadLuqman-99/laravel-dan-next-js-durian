<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Label Pokok - {{ $tree->tag_no }}</title>
    <style>
        @page {
            size: {{ $size === 'small' ? '70mm 50mm' : ($size === 'medium' ? '100mm 70mm' : '148mm 105mm') }};
            margin: 0;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .label {
            width: 100%;
            height: 100%;
            padding: {{ $size === 'small' ? '8mm' : ($size === 'medium' ? '10mm' : '15mm') }};
            box-sizing: border-box;
            border: 2px solid #16a34a;
            background: white;
            display: flex;
            flex-direction: column;
        }

        .header {
            text-align: center;
            border-bottom: 3px solid #16a34a;
            padding-bottom: {{ $size === 'small' ? '3mm' : '5mm' }};
            margin-bottom: {{ $size === 'small' ? '3mm' : '5mm' }};
        }

        .farm-name {
            font-size: {{ $size === 'small' ? '14pt' : ($size === 'medium' ? '18pt' : '24pt') }};
            font-weight: bold;
            color: #16a34a;
            margin: 0;
        }

        .tag-section {
            text-align: center;
            margin: {{ $size === 'small' ? '3mm 0' : '5mm 0' }};
        }

        .tag-no {
            font-size: {{ $size === 'small' ? '24pt' : ($size === 'medium' ? '36pt' : '48pt') }};
            font-weight: bold;
            color: #000;
            margin: {{ $size === 'small' ? '2mm 0' : '5mm 0' }};
            letter-spacing: 2px;
        }

        .info-grid {
            margin-top: auto;
            display: grid;
            grid-template-columns: auto 1fr;
            gap: {{ $size === 'small' ? '2mm' : '3mm' }};
            font-size: {{ $size === 'small' ? '8pt' : ($size === 'medium' ? '10pt' : '12pt') }};
        }

        .info-label {
            font-weight: bold;
            color: #666;
        }

        .info-value {
            color: #000;
        }

        .qr-section {
            text-align: center;
            margin-top: {{ $size === 'small' ? '3mm' : '5mm' }};
        }

        .qr-code {
            max-width: {{ $size === 'small' ? '30mm' : ($size === 'medium' ? '40mm' : '50mm') }};
            height: auto;
        }

        .footer {
            text-align: center;
            margin-top: {{ $size === 'small' ? '2mm' : '3mm' }};
            font-size: {{ $size === 'small' ? '6pt' : '8pt' }};
            color: #999;
        }

        @media print {
            .label {
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
    <div class="label">
        <!-- Header -->
        <div class="header">
            <p class="farm-name">{{ $farmName ?? 'SISTEM KEBUN DURIAN' }}</p>
        </div>

        <!-- Tag Number (Main Focus) -->
        <div class="tag-section">
            <div class="tag-no">{{ $tree->tag_no }}</div>
        </div>

        <!-- Tree Info -->
        <div class="info-grid">
            <span class="info-label">Varieti:</span>
            <span class="info-value">{{ $tree->varieti }}</span>

            <span class="info-label">Umur:</span>
            <span class="info-value">{{ $tree->umur }} tahun</span>

            <span class="info-label">Lokasi:</span>
            <span class="info-value">{{ $tree->lokasi }}</span>

            <span class="info-label">Tanam:</span>
            <span class="info-value">{{ \Carbon\Carbon::parse($tree->tarikh_tanam)->format('d/m/Y') }}</span>
        </div>

        @if($includeQR)
        <!-- QR Code -->
        <div class="qr-section">
            <img src="{{ $qrCode }}" alt="QR Code" class="qr-code">
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            Dicetak pada {{ date('d/m/Y H:i') }}
        </div>
    </div>
</body>
</html>
