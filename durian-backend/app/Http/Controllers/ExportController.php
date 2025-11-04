<?php

namespace App\Http\Controllers;

use App\Exports\PokokDurianExport;
use App\Exports\HasilExport;
use App\Exports\SalesExport;
use App\Exports\ExpensesExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class ExportController extends Controller
{
    /**
     * Export Pokok Durian to Excel
     */
    public function exportPokok()
    {
        $filename = 'Tanaman-' . date('Y-m-d-His') . '.xlsx';
        return Excel::download(new PokokDurianExport, $filename);
    }

    /**
     * Export Hasil to Excel
     */
    public function exportHasil(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $dateRange = '';
        if ($startDate && $endDate) {
            $dateRange = '-' . str_replace('-', '', $startDate) . '-to-' . str_replace('-', '', $endDate);
        }

        $filename = 'Hasil' . $dateRange . '-' . date('Y-m-d-His') . '.xlsx';
        return Excel::download(new HasilExport($startDate, $endDate), $filename);
    }

    /**
     * Export Sales to Excel
     */
    public function exportSales(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $dateRange = '';
        if ($startDate && $endDate) {
            $dateRange = '-' . str_replace('-', '', $startDate) . '-to-' . str_replace('-', '', $endDate);
        }

        $filename = 'Jualan' . $dateRange . '-' . date('Y-m-d-His') . '.xlsx';
        return Excel::download(new SalesExport($startDate, $endDate), $filename);
    }

    /**
     * Export Expenses to Excel
     */
    public function exportExpenses(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $dateRange = '';
        if ($startDate && $endDate) {
            $dateRange = '-' . str_replace('-', '', $startDate) . '-to-' . str_replace('-', '', $endDate);
        }

        $filename = 'Perbelanjaan' . $dateRange . '-' . date('Y-m-d-His') . '.xlsx';
        return Excel::download(new ExpensesExport($startDate, $endDate), $filename);
    }

    /**
     * Export All Data (Comprehensive)
     */
    public function exportAll(Request $request)
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        // Create a multi-sheet Excel file
        $filename = 'Laporan-Lengkap-' . date('Y-m-d-His') . '.xlsx';

        return Excel::download(new class($startDate, $endDate) implements \Maatwebsite\Excel\Concerns\WithMultipleSheets {
            protected $startDate;
            protected $endDate;

            public function __construct($startDate, $endDate)
            {
                $this->startDate = $startDate;
                $this->endDate = $endDate;
            }

            public function sheets(): array
            {
                return [
                    'Tanaman' => new PokokDurianExport(),
                    'Hasil' => new HasilExport($this->startDate, $this->endDate),
                    'Jualan' => new SalesExport($this->startDate, $this->endDate),
                    'Perbelanjaan' => new ExpensesExport($this->startDate, $this->endDate),
                ];
            }
        }, $filename);
    }
}
