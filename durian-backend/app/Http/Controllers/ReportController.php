<?php

namespace App\Http\Controllers;

use App\Models\PokokDurian;
use App\Models\Baja;
use App\Models\Spray;
use App\Models\Hasil;
use App\Models\Inspeksi;
use App\Models\Sale;
use App\Models\Expense;
use Illuminate\Http\Request;
use Carbon\Carbon;
use PDF;

class ReportController extends Controller
{
    /**
     * Generate comprehensive monthly report
     */
    public function monthlyReport(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        // Gather all data for the month
        $data = [
            'period' => $startDate->format('F Y'),
            'start_date' => $startDate->format('d/m/Y'),
            'end_date' => $endDate->format('d/m/Y'),

            // Tree statistics
            'total_trees' => PokokDurian::count(),
            'healthy_trees' => PokokDurian::where('status_kesihatan', 'sihat')->count(),
            'critical_trees' => PokokDurian::where('status_kesihatan', 'kritikal')->count(),

            // Harvest data
            'total_harvest_kg' => Hasil::whereBetween('tarikh_hasil', [$startDate, $endDate])
                ->sum('berat_kg'),
            'harvest_count' => Hasil::whereBetween('tarikh_hasil', [$startDate, $endDate])
                ->count(),
            'harvest_by_grade' => Hasil::whereBetween('tarikh_hasil', [$startDate, $endDate])
                ->selectRaw('gred, SUM(berat_kg) as total_kg')
                ->groupBy('gred')
                ->orderBy('gred')
                ->get(),

            // Sales data
            'total_sales' => Sale::whereBetween('tarikh_jual', [$startDate, $endDate])
                ->sum('jumlah_harga'),
            'sales_count' => Sale::whereBetween('tarikh_jual', [$startDate, $endDate])
                ->count(),
            'sales_by_grade' => Sale::whereBetween('tarikh_jual', [$startDate, $endDate])
                ->selectRaw('gred, SUM(jumlah_harga) as total, SUM(berat_kg) as total_kg')
                ->groupBy('gred')
                ->orderBy('gred')
                ->get(),

            // Expenses data
            'total_expenses' => Expense::whereBetween('tarikh', [$startDate, $endDate])
                ->sum('jumlah'),
            'expenses_count' => Expense::whereBetween('tarikh', [$startDate, $endDate])
                ->count(),
            'expenses_by_category' => Expense::whereBetween('tarikh', [$startDate, $endDate])
                ->selectRaw('kategori, SUM(jumlah) as total')
                ->groupBy('kategori')
                ->orderByDesc('total')
                ->get(),

            // Profit/Loss
            'revenue' => Sale::whereBetween('tarikh_jual', [$startDate, $endDate])
                ->sum('jumlah_harga'),
            'profit_loss' => 0, // Will calculate below

            // Activities
            'fertilizer_applications' => Baja::whereBetween('tarikh_baja', [$startDate, $endDate])
                ->count(),
            'spray_applications' => Spray::whereBetween('tarikh_spray', [$startDate, $endDate])
                ->count(),
            'inspections' => Inspeksi::whereBetween('tarikh_inspeksi', [$startDate, $endDate])
                ->count(),
        ];

        // Calculate profit/loss
        $data['profit_loss'] = $data['revenue'] - $data['total_expenses'];

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Generate comprehensive yearly report
     */
    public function yearlyReport(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);

        $startDate = Carbon::create($year, 1, 1)->startOfYear();
        $endDate = Carbon::create($year, 12, 31)->endOfYear();

        // Gather all data for the year
        $data = [
            'period' => $year,
            'start_date' => $startDate->format('d/m/Y'),
            'end_date' => $endDate->format('d/m/Y'),

            // Tree statistics
            'total_trees' => PokokDurian::count(),
            'healthy_trees' => PokokDurian::where('status_kesihatan', 'sihat')->count(),
            'critical_trees' => PokokDurian::where('status_kesihatan', 'kritikal')->count(),

            // Harvest data
            'total_harvest_kg' => Hasil::whereYear('tarikh_hasil', $year)
                ->sum('berat_kg'),
            'harvest_count' => Hasil::whereYear('tarikh_hasil', $year)
                ->count(),
            'harvest_by_grade' => Hasil::whereYear('tarikh_hasil', $year)
                ->selectRaw('gred, SUM(berat_kg) as total_kg')
                ->groupBy('gred')
                ->orderBy('gred')
                ->get(),
            'harvest_by_month' => Hasil::whereYear('tarikh_hasil', $year)
                ->selectRaw('MONTH(tarikh_hasil) as month, SUM(berat_kg) as total_kg')
                ->groupBy('month')
                ->orderBy('month')
                ->get(),

            // Sales data
            'total_sales' => Sale::whereYear('tarikh_jual', $year)
                ->sum('jumlah_harga'),
            'sales_count' => Sale::whereYear('tarikh_jual', $year)
                ->count(),
            'sales_by_grade' => Sale::whereYear('tarikh_jual', $year)
                ->selectRaw('gred, SUM(jumlah_harga) as total, SUM(berat_kg) as total_kg')
                ->groupBy('gred')
                ->orderBy('gred')
                ->get(),
            'sales_by_month' => Sale::whereYear('tarikh_jual', $year)
                ->selectRaw('MONTH(tarikh_jual) as month, SUM(jumlah_harga) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->get(),

            // Expenses data
            'total_expenses' => Expense::whereYear('tarikh', $year)
                ->sum('jumlah'),
            'expenses_count' => Expense::whereYear('tarikh', $year)
                ->count(),
            'expenses_by_category' => Expense::whereYear('tarikh', $year)
                ->selectRaw('kategori, SUM(jumlah) as total')
                ->groupBy('kategori')
                ->orderByDesc('total')
                ->get(),
            'expenses_by_month' => Expense::whereYear('tarikh', $year)
                ->selectRaw('MONTH(tarikh) as month, SUM(jumlah) as total')
                ->groupBy('month')
                ->orderBy('month')
                ->get(),

            // Profit/Loss
            'revenue' => Sale::whereYear('tarikh_jual', $year)
                ->sum('jumlah_harga'),
            'profit_loss' => 0, // Will calculate below

            // Activities
            'fertilizer_applications' => Baja::whereYear('tarikh_baja', $year)
                ->count(),
            'spray_applications' => Spray::whereYear('tarikh_spray', $year)
                ->count(),
            'inspections' => Inspeksi::whereYear('tarikh_inspeksi', $year)
                ->count(),

            // Top performers
            'top_trees' => Hasil::whereYear('tarikh_hasil', $year)
                ->selectRaw('tree_id, SUM(berat_kg) as total_berat')
                ->groupBy('tree_id')
                ->orderByDesc('total_berat')
                ->limit(10)
                ->with('tree')
                ->get(),
        ];

        // Calculate profit/loss
        $data['profit_loss'] = $data['revenue'] - $data['total_expenses'];

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Generate Profit/Loss Statement
     */
    public function profitLossStatement(Request $request)
    {
        $startDate = Carbon::parse($request->input('start_date'));
        $endDate = Carbon::parse($request->input('end_date'));

        // Revenue breakdown
        $revenue = [
            'sales' => Sale::whereBetween('tarikh_jual', [$startDate, $endDate])
                ->sum('jumlah_harga'),
            'by_grade' => Sale::whereBetween('tarikh_jual', [$startDate, $endDate])
                ->selectRaw('gred, SUM(jumlah_harga) as total')
                ->groupBy('gred')
                ->orderBy('gred')
                ->get(),
            'total' => 0, // Will calculate
        ];
        $revenue['total'] = $revenue['sales'];

        // Expenses breakdown
        $expenses = [
            'by_category' => Expense::whereBetween('tarikh', [$startDate, $endDate])
                ->selectRaw('kategori, SUM(jumlah) as total')
                ->groupBy('kategori')
                ->orderBy('kategori')
                ->get(),
            'total' => Expense::whereBetween('tarikh', [$startDate, $endDate])
                ->sum('jumlah'),
        ];

        // Profit/Loss calculation
        $profitLoss = [
            'gross_revenue' => $revenue['total'],
            'total_expenses' => $expenses['total'],
            'net_profit_loss' => $revenue['total'] - $expenses['total'],
            'margin_percentage' => $revenue['total'] > 0
                ? round(($revenue['total'] - $expenses['total']) / $revenue['total'] * 100, 2)
                : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'period' => [
                    'start' => $startDate->format('d/m/Y'),
                    'end' => $endDate->format('d/m/Y'),
                ],
                'revenue' => $revenue,
                'expenses' => $expenses,
                'summary' => $profitLoss,
            ],
        ]);
    }

    /**
     * Export to PDF - Monthly Report
     */
    public function exportMonthlyPDF(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);

        $reportData = $this->monthlyReport($request)->getData()->data;

        $pdf = PDF::loadView('reports.monthly-pdf', ['data' => $reportData]);

        return $pdf->download("Laporan-Bulanan-{$reportData->period}.pdf");
    }

    /**
     * Export to PDF - Yearly Report
     */
    public function exportYearlyPDF(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);

        $reportData = $this->yearlyReport($request)->getData()->data;

        $pdf = PDF::loadView('reports.yearly-pdf', ['data' => $reportData]);

        return $pdf->download("Laporan-Tahunan-{$reportData->period}.pdf");
    }

    /**
     * Export to PDF - Profit/Loss Statement
     */
    public function exportProfitLossPDF(Request $request)
    {
        $reportData = $this->profitLossStatement($request)->getData()->data;

        $pdf = PDF::loadView('reports.profit-loss-pdf', ['data' => $reportData]);

        $filename = "Penyata-Untung-Rugi-" .
                    str_replace('/', '-', $reportData->period->start) . "-to-" .
                    str_replace('/', '-', $reportData->period->end) . ".pdf";

        return $pdf->download($filename);
    }
}
