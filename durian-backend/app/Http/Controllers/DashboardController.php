<?php

namespace App\Http\Controllers;

use App\Models\PokokDurian;
use App\Models\Hasil;
use App\Models\Inspeksi;
use App\Models\Baja;
use App\Models\Spray;
use App\Models\Expense;
use App\Models\Sale;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function statistics()
    {
        $currentMonth = Carbon::now()->format('Y-m');

        $stats = [
            'total_pokok' => PokokDurian::count(),
            'pokok_sihat' => PokokDurian::where('status_kesihatan', 'sihat')->count(),
            'pokok_kritikal' => PokokDurian::where('status_kesihatan', 'kritikal')->count(),

            'hasil_bulan_ini' => [
                'total_berat' => Hasil::whereYear('tarikh_tuai', Carbon::now()->year)
                    ->whereMonth('tarikh_tuai', Carbon::now()->month)
                    ->sum('berat_kg'),
                'total_biji' => Hasil::whereYear('tarikh_tuai', Carbon::now()->year)
                    ->whereMonth('tarikh_tuai', Carbon::now()->month)
                    ->sum('jumlah_biji'),
                'total_harvest' => Hasil::whereYear('tarikh_tuai', Carbon::now()->year)
                    ->whereMonth('tarikh_tuai', Carbon::now()->month)
                    ->count(),
            ],

            'inspeksi_terbaru' => Inspeksi::with('tree')
                ->latest('tarikh_inspeksi')
                ->limit(5)
                ->get(),

            'status_kesihatan' => PokokDurian::selectRaw('status_kesihatan, count(*) as count')
                ->groupBy('status_kesihatan')
                ->get(),

            'top_trees' => Hasil::selectRaw('tree_id, SUM(berat_kg) as total_berat')
                ->with('tree')
                ->groupBy('tree_id')
                ->orderByDesc('total_berat')
                ->limit(5)
                ->get(),

            // Spray Alerts
            'spray_overdue' => Spray::with('tree')
                ->whereRaw('DATE_ADD(tarikh_spray, INTERVAL interval_hari DAY) < CURDATE()')
                ->latest('tarikh_spray')
                ->limit(10)
                ->get(),

            'spray_due_soon' => Spray::with('tree')
                ->whereRaw('DATE_ADD(tarikh_spray, INTERVAL interval_hari DAY) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)')
                ->latest('tarikh_spray')
                ->limit(10)
                ->get(),

            // Expense Statistics
            'expenses' => [
                'total_bulan_ini' => Expense::whereYear('tarikh', Carbon::now()->year)
                    ->whereMonth('tarikh', Carbon::now()->month)
                    ->sum('jumlah'),
                'total_tahun_ini' => Expense::whereYear('tarikh', Carbon::now()->year)
                    ->sum('jumlah'),
                'by_kategori' => Expense::whereYear('tarikh', Carbon::now()->year)
                    ->selectRaw('kategori, SUM(jumlah) as total')
                    ->groupBy('kategori')
                    ->orderByDesc('total')
                    ->limit(5)
                    ->get(),
                'recent_expenses' => Expense::latest('tarikh')
                    ->limit(5)
                    ->get(),
            ],

            // Sales Statistics
            'sales' => [
                'total_bulan_ini' => Sale::whereYear('tarikh_jual', Carbon::now()->year)
                    ->whereMonth('tarikh_jual', Carbon::now()->month)
                    ->sum('jumlah_harga'),
                'total_tahun_ini' => Sale::whereYear('tarikh_jual', Carbon::now()->year)
                    ->sum('jumlah_harga'),
                'berat_bulan_ini' => Sale::whereYear('tarikh_jual', Carbon::now()->year)
                    ->whereMonth('tarikh_jual', Carbon::now()->month)
                    ->sum('berat_kg'),
                'pending_payment' => Sale::where('status_bayaran', '!=', 'paid')
                    ->sum('jumlah_harga') - Sale::where('status_bayaran', '!=', 'paid')
                    ->sum('jumlah_dibayar'),
                'by_gred' => Sale::whereYear('tarikh_jual', Carbon::now()->year)
                    ->selectRaw('gred, SUM(jumlah_harga) as total')
                    ->groupBy('gred')
                    ->orderByDesc('total')
                    ->get(),
                'recent_sales' => Sale::latest('tarikh_jual')
                    ->limit(5)
                    ->get(),
            ],

            // Profit/Loss Summary
            'profit_loss' => [
                'revenue_bulan_ini' => Sale::whereYear('tarikh_jual', Carbon::now()->year)
                    ->whereMonth('tarikh_jual', Carbon::now()->month)
                    ->sum('jumlah_harga'),
                'expenses_bulan_ini' => Expense::whereYear('tarikh', Carbon::now()->year)
                    ->whereMonth('tarikh', Carbon::now()->month)
                    ->sum('jumlah'),
                'profit_bulan_ini' => Sale::whereYear('tarikh_jual', Carbon::now()->year)
                    ->whereMonth('tarikh_jual', Carbon::now()->month)
                    ->sum('jumlah_harga') -
                    Expense::whereYear('tarikh', Carbon::now()->year)
                    ->whereMonth('tarikh', Carbon::now()->month)
                    ->sum('jumlah'),
                'revenue_tahun_ini' => Sale::whereYear('tarikh_jual', Carbon::now()->year)
                    ->sum('jumlah_harga'),
                'expenses_tahun_ini' => Expense::whereYear('tarikh', Carbon::now()->year)
                    ->sum('jumlah'),
                'profit_tahun_ini' => Sale::whereYear('tarikh_jual', Carbon::now()->year)
                    ->sum('jumlah_harga') -
                    Expense::whereYear('tarikh', Carbon::now()->year)
                    ->sum('jumlah'),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
