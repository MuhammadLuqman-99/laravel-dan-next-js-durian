<?php

namespace App\Exports;

use App\Models\Expense;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExpensesExport implements FromCollection, WithHeadings, WithMapping, WithStyles
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
        $query = Expense::with('user')->orderBy('tarikh', 'desc');

        if ($this->startDate && $this->endDate) {
            $query->whereBetween('tarikh', [$this->startDate, $this->endDate]);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Tarikh',
            'Kategori',
            'Penerangan',
            'Jumlah (RM)',
            'Nota',
            'Direkod Oleh',
            'Tarikh Direkod',
        ];
    }

    public function map($expense): array
    {
        return [
            date('d/m/Y', strtotime($expense->tarikh)),
            ucfirst($expense->kategori),
            $expense->penerangan,
            number_format($expense->jumlah, 2),
            $expense->nota ?: '-',
            $expense->user->name ?? '-',
            date('d/m/Y H:i', strtotime($expense->created_at)),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
