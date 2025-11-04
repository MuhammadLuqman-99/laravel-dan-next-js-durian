<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\ActivityLog;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SaleController extends Controller
{
    use PaginationTrait;

    public function index(Request $request)
    {
        $query = Sale::query();

        // Filter by gred
        if ($request->has('gred')) {
            $query->where('gred', $request->gred);
        }

        // Filter by status_bayaran
        if ($request->has('status_bayaran')) {
            $query->where('status_bayaran', $request->status_bayaran);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('tarikh_jual', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('tarikh_jual', '<=', $request->to_date);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nama_pembeli', 'like', "%{$search}%")
                  ->orWhere('no_telefon', 'like', "%{$search}%");
            });
        }

        $sales = $query->latest('tarikh_jual')->paginate($this->getPaginationSize($request));

        return response()->json([
            'success' => true,
            'data' => $sales,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tarikh_jual' => 'required|date',
            'nama_pembeli' => 'required|string',
            'no_telefon' => 'nullable|string',
            'jumlah_biji' => 'required|integer|min:1',
            'berat_kg' => 'required|numeric|min:0',
            'gred' => 'required|in:A,B,C',
            'harga_sekg' => 'required|numeric|min:0',
            'status_bayaran' => 'required|in:paid,pending,partial',
            'jumlah_dibayar' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        $sale = Sale::create($request->all());

        // Log activity
        ActivityLog::logActivity(
            'create',
            'sale',
            $sale->id,
            "Tambah jualan: {$sale->nama_pembeli} - RM {$sale->jumlah_harga}",
            null,
            $sale->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Jualan berjaya ditambah',
            'data' => $sale,
        ], 201);
    }

    public function show($id)
    {
        $sale = Sale::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $sale,
        ]);
    }

    public function update(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        $oldData = $sale->toArray();

        $request->validate([
            'tarikh_jual' => 'required|date',
            'nama_pembeli' => 'required|string',
            'no_telefon' => 'nullable|string',
            'jumlah_biji' => 'required|integer|min:1',
            'berat_kg' => 'required|numeric|min:0',
            'gred' => 'required|in:A,B,C',
            'harga_sekg' => 'required|numeric|min:0',
            'status_bayaran' => 'required|in:paid,pending,partial',
            'jumlah_dibayar' => 'nullable|numeric|min:0',
            'catatan' => 'nullable|string',
        ]);

        $sale->update($request->all());

        // Log activity
        ActivityLog::logActivity(
            'update',
            'sale',
            $sale->id,
            "Kemaskini jualan: {$sale->nama_pembeli}",
            $oldData,
            $sale->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Jualan berjaya dikemaskini',
            'data' => $sale,
        ]);
    }

    public function destroy($id)
    {
        $sale = Sale::findOrFail($id);
        $oldData = $sale->toArray();

        // Log activity before deleting
        ActivityLog::logActivity(
            'delete',
            'sale',
            $sale->id,
            "Padam jualan: {$sale->nama_pembeli} - RM {$sale->jumlah_harga}",
            $oldData,
            null
        );

        $sale->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jualan berjaya dipadam',
        ]);
    }

    public function statistics(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $month = $request->get('month');

        $query = Sale::whereYear('tarikh_jual', $year);

        if ($month) {
            $query->whereMonth('tarikh_jual', $month);
        }

        // Total sales by grade
        $byGrade = Sale::whereYear('tarikh_jual', $year)
            ->selectRaw('gred, SUM(jumlah_harga) as total_sales, SUM(berat_kg) as total_weight')
            ->groupBy('gred')
            ->get();

        // Monthly trend
        $monthlyTrend = Sale::whereYear('tarikh_jual', $year)
            ->selectRaw('MONTH(tarikh_jual) as month, SUM(jumlah_harga) as total, SUM(berat_kg) as weight')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function($item) {
                return [
                    'month' => Carbon::create()->month($item->month)->format('M'),
                    'total' => (float) $item->total,
                    'weight' => (float) $item->weight,
                ];
            });

        // Payment status
        $byPaymentStatus = Sale::whereYear('tarikh_jual', $year)
            ->selectRaw('status_bayaran, COUNT(*) as count, SUM(jumlah_harga) as total')
            ->groupBy('status_bayaran')
            ->get();

        // Top customers
        $topCustomers = Sale::whereYear('tarikh_jual', $year)
            ->selectRaw('nama_pembeli, SUM(jumlah_harga) as total_spent, COUNT(*) as total_orders')
            ->groupBy('nama_pembeli')
            ->orderByDesc('total_spent')
            ->limit(10)
            ->get();

        $stats = [
            'total_year' => (float) Sale::whereYear('tarikh_jual', $year)->sum('jumlah_harga'),
            'total_month' => $month ? (float) $query->sum('jumlah_harga') : 0,
            'total_weight_year' => (float) Sale::whereYear('tarikh_jual', $year)->sum('berat_kg'),
            'by_grade' => $byGrade->map(function($item) {
                return [
                    'gred' => $item->gred,
                    'total_sales' => (float) $item->total_sales,
                    'total_weight' => (float) $item->total_weight,
                ];
            }),
            'monthly_trend' => $monthlyTrend,
            'by_payment_status' => $byPaymentStatus->map(function($item) {
                return [
                    'status' => $item->status_bayaran,
                    'count' => $item->count,
                    'total' => (float) $item->total,
                ];
            }),
            'top_customers' => $topCustomers,
            'pending_payments' => (float) Sale::where('status_bayaran', '!=', 'paid')->sum('jumlah_harga'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
