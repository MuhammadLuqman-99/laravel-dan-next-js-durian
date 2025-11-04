<?php

namespace App\Exports;

use App\Models\Hasil;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class HasilExport implements FromCollection, WithHeadings, WithMapping, WithStyles
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
        $query = Hasil::with(['tree', 'user'])->orderBy('tarikh_hasil', 'desc');

        if ($this->startDate && $this->endDate) {
            $query->whereBetween('tarikh_hasil', [$this->startDate, $this->endDate]);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Tarikh Hasil',
            'Tag Pokok',
            'Gred',
            'Berat (kg)',
            'Harga Per KG (RM)',
            'Jumlah Harga (RM)',
            'Nota',
            'Direkod Oleh',
            'Tarikh Direkod',
        ];
    }

    public function map($hasil): array
    {
        return [
            date('d/m/Y', strtotime($hasil->tarikh_hasil)),
            $hasil->tree->tag_no ?? '-',
            $hasil->gred,
            number_format($hasil->berat_kg, 2),
            number_format($hasil->harga_per_kg, 2),
            number_format($hasil->jumlah_harga, 2),
            $hasil->nota ?: '-',
            $hasil->user->name ?? '-',
            date('d/m/Y H:i', strtotime($hasil->created_at)),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
