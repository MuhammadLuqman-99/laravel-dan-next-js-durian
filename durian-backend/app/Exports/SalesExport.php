<?php

namespace App\Exports;

use App\Models\Sale;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class SalesExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $startDate;
    protected $endDate;

    public function __construct($startDate = null, $endDate = null)
    {
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }

    public function collection()
    {
        $query = Sale::with('user')->orderBy('tarikh_jual', 'desc');

        if ($this->startDate && $this->endDate) {
            $query->whereBetween('tarikh_jual', [$this->startDate, $this->endDate]);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Tarikh Jual',
            'Nama Pembeli',
            'Gred',
            'Berat (kg)',
            'Harga Per KG (RM)',
            'Jumlah Harga (RM)',
            'Jumlah Dibayar (RM)',
            'Baki (RM)',
            'Status Bayaran',
            'Kaedah Bayaran',
            'Nota',
            'Direkod Oleh',
            'Tarikh Direkod',
        ];
    }

    public function map($sale): array
    {
        return [
            date('d/m/Y', strtotime($sale->tarikh_jual)),
            $sale->nama_pembeli,
            $sale->gred,
            number_format($sale->berat_kg, 2),
            number_format($sale->harga_per_kg, 2),
            number_format($sale->jumlah_harga, 2),
            number_format($sale->jumlah_dibayar, 2),
            number_format($sale->baki, 2),
            ucfirst($sale->status_bayaran),
            $sale->kaedah_bayaran ?: '-',
            $sale->nota ?: '-',
            $sale->user->name ?? '-',
            date('d/m/Y H:i', strtotime($sale->created_at)),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
