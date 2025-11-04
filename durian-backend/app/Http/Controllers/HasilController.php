<?php

namespace App\Http\Controllers;

use App\Models\Hasil;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HasilController extends Controller
{
    use PaginationTrait;

    public function index(Request $request)
    {
        $query = Hasil::with('tree');

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('tarikh_tuai', [$request->start_date, $request->end_date]);
        }

        // Filter by tree
        if ($request->has('tree_id')) {
            $query->where('tree_id', $request->tree_id);
        }

        // Filter by quality
        if ($request->has('kualiti')) {
            $query->where('kualiti', $request->kualiti);
        }

        $hasil = $query->latest('tarikh_tuai')->paginate($this->getPaginationSize($request));

        return response()->json([
            'success' => true,
            'data' => $hasil,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tree_id' => 'required|exists:pokok_durian,id',
            'tarikh_tuai' => 'required|date',
            'jumlah_biji' => 'required|integer|min:0',
            'berat_kg' => 'required|numeric|min:0',
            'kualiti' => 'required|in:A,B,C',
            'catatan' => 'nullable|string',
        ]);

        $hasil = Hasil::create($request->all());
        $hasil->load('tree');

        return response()->json([
            'success' => true,
            'message' => 'Rekod hasil berjaya ditambah',
            'data' => $hasil,
        ], 201);
    }

    public function show($id)
    {
        $hasil = Hasil::with('tree')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $hasil,
        ]);
    }

    public function update(Request $request, $id)
    {
        $hasil = Hasil::findOrFail($id);

        $request->validate([
            'tree_id' => 'required|exists:pokok_durian,id',
            'tarikh_tuai' => 'required|date',
            'jumlah_biji' => 'required|integer|min:0',
            'berat_kg' => 'required|numeric|min:0',
            'kualiti' => 'required|in:A,B,C',
            'catatan' => 'nullable|string',
        ]);

        $hasil->update($request->all());
        $hasil->load('tree');

        return response()->json([
            'success' => true,
            'message' => 'Rekod hasil berjaya dikemaskini',
            'data' => $hasil,
        ]);
    }

    public function destroy($id)
    {
        $hasil = Hasil::findOrFail($id);
        $hasil->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rekod hasil berjaya dipadam',
        ]);
    }

    public function monthlyStatistics(Request $request)
    {
        $year = $request->get('year', date('Y'));
        $month = $request->get('month', date('m'));

        $stats = Hasil::whereYear('tarikh_tuai', $year)
            ->whereMonth('tarikh_tuai', $month)
            ->selectRaw('
                COUNT(*) as total_harvest,
                SUM(jumlah_biji) as total_biji,
                SUM(berat_kg) as total_berat,
                AVG(berat_kg) as avg_berat,
                kualiti,
                COUNT(*) as count_by_quality
            ')
            ->groupBy('kualiti')
            ->get();

        $monthly = Hasil::selectRaw('
                YEAR(tarikh_tuai) as year,
                MONTH(tarikh_tuai) as month,
                SUM(berat_kg) as total_berat,
                COUNT(*) as total_harvest
            ')
            ->whereYear('tarikh_tuai', $year)
            ->groupBy('year', 'month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'current_month' => $stats,
                'yearly_trend' => $monthly,
            ],
        ]);
    }
}
