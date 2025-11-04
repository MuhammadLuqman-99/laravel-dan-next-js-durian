<?php

namespace App\Http\Controllers;

use App\Models\BusutMaintenance;
use App\Models\Busut;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class BusutMaintenanceController extends Controller
{
    /**
     * Get maintenance records (with filters)
     */
    public function index(Request $request)
    {
        $query = BusutMaintenance::with(['busut.zone', 'user'])
            ->latest('tarikh');

        // Filter by busut
        if ($request->has('busut_id')) {
            $query->where('busut_id', $request->busut_id);
        }

        // Filter by maintenance type
        if ($request->has('maintenance_type')) {
            $query->where('maintenance_type', $request->maintenance_type);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('tarikh', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('tarikh', '<=', $request->date_to);
        }

        $records = $query->paginate(50);

        return response()->json([
            'success' => true,
            'data' => $records
        ]);
    }

    /**
     * Get specific maintenance record
     */
    public function show($id)
    {
        $record = BusutMaintenance::with(['busut.zone', 'user'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $record
        ]);
    }

    /**
     * Create maintenance record
     */
    public function store(Request $request)
    {
        $request->validate([
            'busut_id' => 'required|exists:busut,id',
            'maintenance_type' => 'required|in:soil_test,naik_tanah,repair_erosion,fertilization,drainage_check,other',
            'tarikh' => 'required|date',
            'findings' => 'nullable|string',
            'actions_taken' => 'nullable|string',
            'cost' => 'nullable|numeric|min:0',
            'ph_level' => 'nullable|numeric|between:0,14',
            'nitrogen' => 'nullable|numeric|min:0',
            'phosphorus' => 'nullable|numeric|min:0',
            'potassium' => 'nullable|numeric|min:0',
            'recommendations' => 'nullable|string',
        ]);

        $record = BusutMaintenance::create(array_merge($request->all(), [
            'user_id' => auth()->id(),
        ]));

        // Update busut last_maintenance date
        $busut = Busut::find($request->busut_id);
        $busut->last_maintenance = $request->tarikh;

        // Update soil pH if it's a soil test
        if ($request->maintenance_type === 'soil_test' && $request->ph_level) {
            $busut->soil_ph = $request->ph_level;
            $busut->last_soil_test = $request->tarikh;
        }

        $busut->save();

        ActivityLog::logActivity(
            'create',
            'busut_maintenance',
            $record->id,
            "Tambah maintenance record untuk busut {$busut->busut_code}: {$request->maintenance_type}",
            null,
            $record->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Maintenance record berjaya ditambah',
            'data' => $record->load(['busut.zone', 'user'])
        ], 201);
    }

    /**
     * Update maintenance record
     */
    public function update(Request $request, $id)
    {
        $record = BusutMaintenance::findOrFail($id);
        $oldData = $record->toArray();

        $request->validate([
            'maintenance_type' => 'required|in:soil_test,naik_tanah,repair_erosion,fertilization,drainage_check,other',
            'tarikh' => 'required|date',
            'findings' => 'nullable|string',
            'actions_taken' => 'nullable|string',
            'cost' => 'nullable|numeric|min:0',
            'ph_level' => 'nullable|numeric|between:0,14',
            'nitrogen' => 'nullable|numeric|min:0',
            'phosphorus' => 'nullable|numeric|min:0',
            'potassium' => 'nullable|numeric|min:0',
            'recommendations' => 'nullable|string',
        ]);

        $record->update($request->all());

        ActivityLog::logActivity(
            'update',
            'busut_maintenance',
            $record->id,
            "Kemaskini maintenance record",
            $oldData,
            $record->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Maintenance record berjaya dikemaskini',
            'data' => $record->load(['busut.zone', 'user'])
        ]);
    }

    /**
     * Delete maintenance record
     */
    public function destroy($id)
    {
        $record = BusutMaintenance::findOrFail($id);
        $oldData = $record->toArray();

        ActivityLog::logActivity(
            'delete',
            'busut_maintenance',
            $record->id,
            "Padam maintenance record",
            $oldData,
            null
        );

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Maintenance record berjaya dipadam'
        ]);
    }

    /**
     * Get maintenance statistics
     */
    public function statistics(Request $request)
    {
        $query = BusutMaintenance::query();

        // Filter by date range
        if ($request->has('date_from')) {
            $query->where('tarikh', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->where('tarikh', '<=', $request->date_to);
        }

        $stats = [
            'total_maintenance' => $query->count(),
            'by_type' => $query->select('maintenance_type', \DB::raw('count(*) as count'))
                ->groupBy('maintenance_type')
                ->pluck('count', 'maintenance_type'),
            'total_cost' => $query->sum('cost'),
            'average_cost' => $query->avg('cost'),
            'recent_activities' => BusutMaintenance::with(['busut.zone', 'user'])
                ->latest('tarikh')
                ->limit(10)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
