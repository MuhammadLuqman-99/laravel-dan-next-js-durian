<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Batch Label Pokok</title>
    <style>
        @page {
            size: A4;
            margin: 10mm;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
        }

        .page {
            width: 100%;
            display: grid;
            grid-template-columns: repeat({{ $columns }}, 1fr);
            gap: 5mm;
            page-break-after: always;
        }

        .page:last-child {
            page-break-after: auto;
        }

        .label {
            border: 2px solid #16a34a;
            padding: 5mm;
            box-sizing: border-box;
            background: white;
            page-break-inside: avoid;
            height: fit-content;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #16a34a;
            padding-bottom: 2mm;
            margin-bottom: 3mm;
        }

        .farm-name {
            font-size: 10pt;
            font-weight: bold;
            color: #16a34a;
            margin: 0;
        }

        .tag-section {
            text-align: center;
            margin: 2mm 0;
        }

        .tag-no {
            font-size: 18pt;
            font-weight: bold;
            color: #000;
            margin: 2mm 0;
            letter-spacing: 1px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 1mm 2mm;
            font-size: 8pt;
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
            margin-top: 2mm;
        }

        .qr-code {
            max-width: 25mm;
            height: auto;
        }

        .footer {
            text-align: center;
            margin-top: 2mm;
            font-size: 6pt;
            color: #999;
        }
    </style>
</head>
<body>
    @foreach($trees->chunk($columns * $rows) as $pageChunk)
    <div class="page">
        @foreach($pageChunk as $tree)
        <div class="label">
            <!-- Header -->
            <div class="header">
                <p class="farm-name">{{ $farmName ?? 'SISTEM KEBUN' }}</p>
            </div>

            <!-- Tag Number -->
            <div class="tag-section">
                <div class="tag-no">{{ $tree->tag_no }}</div>
            </div>

            <!-- Tree Info -->
            <div class="info-grid">
                <span class="info-label">Varieti:</span>
                <span class="info-value">{{ $tree->varieti }}</span>

                <span class="info-label">Umur:</span>
                <span class="info-value">{{ $tree->umur }}th</span>

                <span class="info-label">Lokasi:</span>
                <span class="info-value">{{ $tree->lokasi }}</span>
            </div>

            @if($includeQR && isset($qrCodes[$tree->id]))
            <!-- QR Code -->
            <div class="qr-section">
                <img src="{{ $qrCodes[$tree->id] }}" alt="QR" class="qr-code">
            </div>
            @endif

            <!-- Footer -->
            <div class="footer">
                {{ date('d/m/Y') }}
            </div>
        </div>
        @endforeach
    </div>
    @endforeach
</body>
</html>
