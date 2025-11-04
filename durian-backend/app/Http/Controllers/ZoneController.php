<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ZoneController extends Controller
{
    /**
     * Get all zones with statistics
     */
    public function index()
    {
        $zones = Zone::withCount(['busut', 'pokok'])
            ->with(['busut' => function($query) {
                $query->select('zone_id', 'status', \DB::raw('count(*) as count'))
                    ->groupBy('zone_id', 'status');
            }])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $zones->map(function($zone) {
                return [
                    'id' => $zone->id,
                    'name' => $zone->name,
                    'code' => $zone->code,
                    'description' => $zone->description,
                    'total_busut' => $zone->busut_count,
                    'total_pokok' => $zone->pokok_count,
                    'total_area_hectares' => $zone->total_area_hectares,
                    'color_code' => $zone->color_code,
                    'statistics' => $zone->statistics,
                ];
            })
        ]);
    }

    /**
     * Get specific zone with busut list
     */
    public function show($id)
    {
        $zone = Zone::with(['busut' => function($query) {
            $query->withCount('pokok')
                ->orderBy('busut_number');
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $zone
        ]);
    }

    /**
     * Create new zone
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:zones,code',
            'description' => 'nullable|string',
            'total_busut' => 'nullable|integer|min:0',
            'total_area_hectares' => 'nullable|numeric|min:0',
            'color_code' => 'nullable|string|max:7',
        ]);

        $zone = Zone::create($request->all());

        ActivityLog::logActivity(
            'create',
            'zone',
            $zone->id,
            "Tambah zone baru: {$zone->name}",
            null,
            $zone->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Zone berjaya ditambah',
            'data' => $zone
        ], 201);
    }

    /**
     * Update zone
     */
    public function update(Request $request, $id)
    {
        $zone = Zone::findOrFail($id);
        $oldData = $zone->toArray();

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:zones,code,' . $id,
            'description' => 'nullable|string',
            'total_busut' => 'nullable|integer|min:0',
            'total_area_hectares' => 'nullable|numeric|min:0',
            'color_code' => 'nullable|string|max:7',
        ]);

        $zone->update($request->all());

        ActivityLog::logActivity(
            'update',
            'zone',
            $zone->id,
            "Kemaskini zone: {$zone->name}",
            $oldData,
            $zone->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Zone berjaya dikemaskini',
            'data' => $zone
        ]);
    }

    /**
     * Delete zone
     */
    public function destroy($id)
    {
        $zone = Zone::findOrFail($id);
        $oldData = $zone->toArray();

        ActivityLog::logActivity(
            'delete',
            'zone',
            $zone->id,
            "Padam zone: {$zone->name}",
            $oldData,
            null
        );

        $zone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Zone berjaya dipadam'
        ]);
    }

    /**
     * Get zone statistics
     */
    public function statistics($id)
    {
        $zone = Zone::findOrFail($id);

        $stats = [
            'total_busut' => $zone->busut()->count(),
            'total_pokok' => $zone->pokok()->count(),
            'busut_by_status' => $zone->busut()
                ->select('status', \DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
            'average_utilization' => $zone->busut()
                ->avg(\DB::raw('(current_trees / capacity_trees) * 100')),
            'total_capacity' => $zone->busut()->sum('capacity_trees'),
            'total_current' => $zone->busut()->sum('current_trees'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
