<?php

namespace App\Exports;

use App\Models\PokokDurian;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PokokDurianExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    public function collection()
    {
        return PokokDurian::with('user')->orderBy('tag_no')->get();
    }

    public function headings(): array
    {
        return [
            'Tag No',
            'Varieti',
            'Umur Pokok (Tahun)',
            'Lokasi',
            'Status Kesihatan',
            'Tarikh Tanam',
            'Nota',
            'Dibuat Oleh',
            'Tarikh Dibuat',
        ];
    }

    public function map($pokok): array
    {
        return [
            $pokok->tag_no,
            $pokok->varieti,
            $pokok->umur_pokok,
            $pokok->lokasi,
            ucfirst($pokok->status_kesihatan),
            $pokok->tarikh_tanam ? date('d/m/Y', strtotime($pokok->tarikh_tanam)) : '-',
            $pokok->nota ?: '-',
            $pokok->user->name ?? '-',
            date('d/m/Y H:i', strtotime($pokok->created_at)),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
