<?php

namespace App\Http\Controllers;

use App\Models\Baja;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;

class BajaController extends Controller
{
    use PaginationTrait;

    public function index(Request $request)
    {
        $query = Baja::with(['tree', 'pekerja']);

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('tarikh_baja', [$request->start_date, $request->end_date]);
        }

        // Filter by tree
        if ($request->has('tree_id')) {
            $query->where('tree_id', $request->tree_id);
        }

        // Filter by pekerja
        if ($request->has('pekerja_id')) {
            $query->where('pekerja_id', $request->pekerja_id);
        }

        $baja = $query->latest('tarikh_baja')->paginate($this->getPaginationSize($request));

        return response()->json([
            'success' => true,
            'data' => $baja,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tree_id' => 'required|exists:pokok_durian,id',
            'tarikh_baja' => 'required|date',
            'jenis_baja' => 'required|string',
            'jumlah' => 'required|numeric|min:0',
            'pekerja_id' => 'required|exists:users,id',
            'catatan' => 'nullable|string',
        ]);

        $baja = Baja::create($request->all());
        $baja->load(['tree', 'pekerja']);

        return response()->json([
            'success' => true,
            'message' => 'Rekod baja berjaya ditambah',
            'data' => $baja,
        ], 201);
    }

    public function show($id)
    {
        $baja = Baja::with(['tree', 'pekerja'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $baja,
        ]);
    }

    public function update(Request $request, $id)
    {
        $baja = Baja::findOrFail($id);

        $request->validate([
            'tree_id' => 'required|exists:pokok_durian,id',
            'tarikh_baja' => 'required|date',
            'jenis_baja' => 'required|string',
            'jumlah' => 'required|numeric|min:0',
            'pekerja_id' => 'required|exists:users,id',
            'catatan' => 'nullable|string',
        ]);

        $baja->update($request->all());
        $baja->load(['tree', 'pekerja']);

        return response()->json([
            'success' => true,
            'message' => 'Rekod baja berjaya dikemaskini',
            'data' => $baja,
        ]);
    }

    public function destroy($id)
    {
        $baja = Baja::findOrFail($id);
        $baja->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rekod baja berjaya dipadam',
        ]);
    }
}
