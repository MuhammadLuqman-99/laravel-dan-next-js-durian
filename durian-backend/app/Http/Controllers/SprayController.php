<?php

namespace App\Http\Controllers;

use App\Models\Spray;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;

class SprayController extends Controller
{
    use PaginationTrait;

    public function index(Request $request)
    {
        $query = Spray::with('tree');

        // Filter by tree
        if ($request->has('tree_id')) {
            $query->where('tree_id', $request->tree_id);
        }

        // Filter by jenis
        if ($request->has('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        // Filter overdue only
        if ($request->has('overdue') && $request->overdue) {
            $query->whereRaw('DATE_ADD(tarikh_spray, INTERVAL interval_hari DAY) < CURDATE()');
        }

        $spray = $query->latest('tarikh_spray')->paginate($this->getPaginationSize($request));

        return response()->json([
            'success' => true,
            'data' => $spray,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tree_id' => 'required|exists:pokok_durian,id',
            'tarikh_spray' => 'required|date',
            'jenis' => 'required|in:racun,foliar,pesticide,fungicide,lain-lain',
            'nama_bahan' => 'required|string',
            'dosage' => 'nullable|string',
            'interval_hari' => 'required|integer|min:1|max:90',
            'pekerja' => 'required|string',
            'catatan' => 'nullable|string',
        ]);

        $spray = Spray::create($request->all());
        $spray->load('tree');

        return response()->json([
            'success' => true,
            'message' => 'Rekod spray berjaya ditambah',
            'data' => $spray,
        ], 201);
    }

    public function show($id)
    {
        $spray = Spray::with('tree')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $spray,
        ]);
    }

    public function update(Request $request, $id)
    {
        $spray = Spray::findOrFail($id);

        $request->validate([
            'tree_id' => 'required|exists:pokok_durian,id',
            'tarikh_spray' => 'required|date',
            'jenis' => 'required|in:racun,foliar,pesticide,fungicide,lain-lain',
            'nama_bahan' => 'required|string',
            'dosage' => 'nullable|string',
            'interval_hari' => 'required|integer|min:1|max:90',
            'pekerja' => 'required|string',
            'catatan' => 'nullable|string',
        ]);

        $spray->update($request->all());
        $spray->load('tree');

        return response()->json([
            'success' => true,
            'message' => 'Rekod spray berjaya dikemaskini',
            'data' => $spray,
        ]);
    }

    public function destroy($id)
    {
        $spray = Spray::findOrFail($id);
        $spray->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rekod spray berjaya dipadam',
        ]);
    }

    // Get overdue sprays
    public function overdueList()
    {
        $overdue = Spray::with('tree')
            ->whereRaw('DATE_ADD(tarikh_spray, INTERVAL interval_hari DAY) < CURDATE()')
            ->latest('tarikh_spray')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $overdue,
        ]);
    }

    // Get upcoming sprays (next 7 days)
    public function upcomingList()
    {
        $upcoming = Spray::with('tree')
            ->whereRaw('DATE_ADD(tarikh_spray, INTERVAL interval_hari DAY) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)')
            ->latest('tarikh_spray')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $upcoming,
        ]);
    }
}
