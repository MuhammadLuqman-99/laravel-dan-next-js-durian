<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\ActivityLog;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ExpenseController extends Controller
{
    use PaginationTrait;

    public function index(Request $request)
    {
        $query = Expense::query();

        // Filter by kategori
        if ($request->has('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('tarikh', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('tarikh', '<=', $request->to_date);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('item', 'like', "%{$search}%")
                  ->orWhere('pembekal', 'like', "%{$search}%");
            });
        }

        $expenses = $query->latest('tarikh')->paginate($this->getPaginationSize($request));

        return response()->json([
            'success' => true,
            'data' => $expenses,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tarikh' => 'required|date',
            'kategori' => 'required|in:baja,racun,peralatan,pekerja,utiliti,lain-lain',
            'item' => 'required|string',
            'kuantiti' => 'required|integer|min:1',
            'unit' => 'nullable|string',
            'harga_seunit' => 'required|numeric|min:0',
            'pembekal' => 'nullable|string',
            'catatan' => 'nullable|string',
            'resit' => 'nullable|image|max:2048', // 2MB max
        ]);

        $expense = new Expense($request->except('resit'));

        // Handle receipt image upload
        if ($request->hasFile('resit')) {
            $path = $request->file('resit')->store('receipts', 'public');
            $expense->resit = $path;
        }

        $expense->save();

        // Log activity
        ActivityLog::logActivity(
            'create',
            'expense',
            $expense->id,
            "Tambah perbelanjaan: {$expense->item} - RM {$expense->jumlah}",
            null,
            $expense->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Perbelanjaan berjaya ditambah',
            'data' => $expense,
        ], 201);
    }

    public function show($id)
    {
        $expense = Expense::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $expense,
        ]);
    }

    public function update(Request $request, $id)
    {
        $expense = Expense::findOrFail($id);
        $oldData = $expense->toArray();

        $request->validate([
            'tarikh' => 'required|date',
            'kategori' => 'required|in:baja,racun,peralatan,pekerja,utiliti,lain-lain',
            'item' => 'required|string',
            'kuantiti' => 'required|integer|min:1',
            'unit' => 'nullable|string',
            'harga_seunit' => 'required|numeric|min:0',
            'pembekal' => 'nullable|string',
            'catatan' => 'nullable|string',
            'resit' => 'nullable|image|max:2048',
        ]);

        $expense->fill($request->except('resit'));

        // Handle receipt image upload
        if ($request->hasFile('resit')) {
            // Delete old receipt
            if ($expense->resit) {
                Storage::disk('public')->delete($expense->resit);
            }
            $path = $request->file('resit')->store('receipts', 'public');
            $expense->resit = $path;
        }

        $expense->save();

        // Log activity
        ActivityLog::logActivity(
            'update',
            'expense',
            $expense->id,
            "Kemaskini perbelanjaan: {$expense->item}",
            $oldData,
            $expense->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Perbelanjaan berjaya dikemaskini',
            'data' => $expense,
        ]);
    }

    public function destroy($id)
    {
        $expense = Expense::findOrFail($id);
        $oldData = $expense->toArray();

        // Log activity before deleting
        ActivityLog::logActivity(
            'delete',
            'expense',
            $expense->id,
            "Padam perbelanjaan: {$expense->item} - RM {$expense->jumlah}",
            $oldData,
            null
        );

        // Delete receipt image
        if ($expense->resit) {
            Storage::disk('public')->delete($expense->resit);
        }

        $expense->delete();

        return response()->json([
            'success' => true,
            'message' => 'Perbelanjaan berjaya dipadam',
        ]);
    }

    public function statistics(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $month = $request->get('month');

        $query = Expense::whereYear('tarikh', $year);

        if ($month) {
            $query->whereMonth('tarikh', $month);
        }

        // Total by category
        $byCategory = Expense::whereYear('tarikh', $year)
            ->selectRaw('kategori, SUM(jumlah) as total')
            ->groupBy('kategori')
            ->get();

        // Monthly trend
        $monthlyTrend = Expense::whereYear('tarikh', $year)
            ->selectRaw('MONTH(tarikh) as month, SUM(jumlah) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function($item) {
                return [
                    'month' => Carbon::create()->month($item->month)->format('M'),
                    'total' => (float) $item->total,
                ];
            });

        // Recent expenses
        $recentExpenses = Expense::latest('tarikh')
            ->take(10)
            ->get();

        $stats = [
            'total_year' => (float) Expense::whereYear('tarikh', $year)->sum('jumlah'),
            'total_month' => $month ? (float) $query->sum('jumlah') : 0,
            'by_category' => $byCategory->map(function($item) {
                return [
                    'kategori' => $item->kategori,
                    'total' => (float) $item->total,
                ];
            }),
            'monthly_trend' => $monthlyTrend,
            'recent_expenses' => $recentExpenses,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
