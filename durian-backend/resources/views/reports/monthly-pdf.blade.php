<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Bulanan - {{ $data->period }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #16a34a;
            padding-bottom: 15px;
        }
        .header h1 {
            color: #16a34a;
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            background-color: #16a34a;
            color: white;
            padding: 8px 12px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .stat-row {
            display: table-row;
        }
        .stat-cell {
            display: table-cell;
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
        }
        .stat-label {
            font-weight: bold;
            width: 60%;
        }
        .stat-value {
            text-align: right;
            color: #16a34a;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th {
            background-color: #f3f4f6;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #e5e7eb;
        }
        td {
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
        }
        .profit { color: #16a34a; font-weight: bold; }
        .loss { color: #dc2626; font-weight: bold; }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>LAPORAN BULANAN</h1>
        <p><strong>Sistem Pengurusan Kebun</strong></p>
        <p>Tempoh: {{ $data->period }}</p>
        <p>{{ $data->start_date }} hingga {{ $data->end_date }}</p>
    </div>

    <!-- Tree Statistics -->
    <div class="section">
        <div class="section-title">STATISTIK POKOK</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-cell stat-label">Jumlah Pokok</div>
                <div class="stat-cell stat-value">{{ $data->total_trees }} pokok</div>
            </div>
            <div class="stat-row">
                <div class="stat-cell stat-label">Pokok Sihat</div>
                <div class="stat-cell stat-value">{{ $data->healthy_trees }} pokok</div>
            </div>
            <div class="stat-row">
                <div class="stat-cell stat-label">Pokok Kritikal</div>
                <div class="stat-cell stat-value">{{ $data->critical_trees }} pokok</div>
            </div>
        </div>
    </div>

    <!-- Harvest Statistics -->
    <div class="section">
        <div class="section-title">HASIL TUAIAN</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-cell stat-label">Jumlah Hasil</div>
                <div class="stat-cell stat-value">{{ number_format($data->total_harvest_kg, 2) }} kg</div>
            </div>
            <div class="stat-row">
                <div class="stat-cell stat-label">Bilangan Tuaian</div>
                <div class="stat-cell stat-value">{{ $data->harvest_count }} kali</div>
            </div>
        </div>

        @if(count($data->harvest_by_grade) > 0)
        <table>
            <thead>
                <tr>
                    <th>Gred</th>
                    <th style="text-align: right;">Jumlah (kg)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data->harvest_by_grade as $item)
                <tr>
                    <td>Gred {{ $item->gred }}</td>
                    <td style="text-align: right;">{{ number_format($item->total_kg, 2) }} kg</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Sales Statistics -->
    <div class="section">
        <div class="section-title">JUALAN</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-cell stat-label">Jumlah Jualan</div>
                <div class="stat-cell stat-value">RM {{ number_format($data->total_sales, 2) }}</div>
            </div>
            <div class="stat-row">
                <div class="stat-cell stat-label">Bilangan Transaksi</div>
                <div class="stat-cell stat-value">{{ $data->sales_count }} transaksi</div>
            </div>
        </div>

        @if(count($data->sales_by_grade) > 0)
        <table>
            <thead>
                <tr>
                    <th>Gred</th>
                    <th style="text-align: right;">Berat (kg)</th>
                    <th style="text-align: right;">Jumlah (RM)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data->sales_by_grade as $item)
                <tr>
                    <td>Gred {{ $item->gred }}</td>
                    <td style="text-align: right;">{{ number_format($item->total_kg, 2) }}</td>
                    <td style="text-align: right;">RM {{ number_format($item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Expenses Statistics -->
    <div class="section">
        <div class="section-title">PERBELANJAAN</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-cell stat-label">Jumlah Perbelanjaan</div>
                <div class="stat-cell stat-value">RM {{ number_format($data->total_expenses, 2) }}</div>
            </div>
            <div class="stat-row">
                <div class="stat-cell stat-label">Bilangan Transaksi</div>
                <div class="stat-cell stat-value">{{ $data->expenses_count }} transaksi</div>
            </div>
        </div>

        @if(count($data->expenses_by_category) > 0)
        <table>
            <thead>
                <tr>
                    <th>Kategori</th>
                    <th style="text-align: right;">Jumlah (RM)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data->expenses_by_category as $item)
                <tr>
                    <td style="text-transform: capitalize;">{{ $item->kategori }}</td>
                    <td style="text-align: right;">RM {{ number_format($item->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Profit/Loss Summary -->
    <div class="section">
        <div class="section-title">RINGKASAN UNTUNG RUGI</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-cell stat-label">Hasil Jualan</div>
                <div class="stat-cell stat-value profit">RM {{ number_format($data->revenue, 2) }}</div>
            </div>
            <div class="stat-row">
                <div class="stat-cell stat-label">Jumlah Perbelanjaan</div>
                <div class="stat-cell stat-value loss">RM {{ number_format($data->total_expenses, 2) }}</div>
            </div>
            <div class="stat-row">
                <div class="stat-cell stat-label"><strong>UNTUNG/RUGI BERSIH</strong></div>
                <div class="stat-cell stat-value {{ $data->profit_loss >= 0 ? 'profit' : 'loss' }}">
                    RM {{ number_format($data->profit_loss, 2) }}
                </div>
            </div>
        </div>
    </div>

    <!-- Activities Summary -->
    <div class="section">
        <div class="section-title">AKTIVITI LADANG</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-cell stat-label">Aplikasi Baja</div>
                <div class="stat-cell stat-value">{{ $data->fertilizer_applications }} kali</div>
            </div>
            <div class="stat-row">
                <div class="stat-cell stat-label">Aplikasi Racun</div>
                <div class="stat-cell stat-value">{{ $data->spray_applications }} kali</div>
            </div>
            <div class="stat-row">
                <div class="stat-cell stat-label">Inspeksi Dijalankan</div>
                <div class="stat-cell stat-value">{{ $data->inspections }} kali</div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>Laporan dijana secara automatik pada {{ date('d/m/Y H:i:s') }}</p>
        <p>Sistem Pengurusan Kebun - © {{ date('Y') }}</p>
    </div>
</body>
</html>
