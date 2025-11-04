<?php

namespace App\Http\Controllers;

use App\Models\Busut;
use App\Models\Zone;
use App\Models\ActivityLog;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;

class BusutController extends Controller
{
    use PaginationTrait;

    /**
     * Get all busut with pagination and filters
     */
    public function index(Request $request)
    {
        $query = Busut::with(['zone', 'pokok'])
            ->withCount('pokok');

        // Filter by zone
        if ($request->has('zone_id')) {
            $query->where('zone_id', $request->zone_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by busut code or notes
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('busut_code', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'busut_code');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $busut = $query->paginate($this->getPaginationSize($request));

        return response()->json([
            'success' => true,
            'data' => $busut
        ]);
    }

    /**
     * Get specific busut with all details
     */
    public function show($id)
    {
        $busut = Busut::with([
            'zone',
            'pokok' => function($query) {
                $query->select('id', 'tag_no', 'varieti', 'status_kesihatan', 'busut_id', 'position_in_busut')
                    ->orderBy('position_in_busut');
            },
            'maintenanceRecords' => function($query) {
                $query->with('user:id,name')
                    ->latest('tarikh')
                    ->limit(10);
            }
        ])->findOrFail($id);

        // Add computed properties
        $busut->is_full = $busut->is_full;
        $busut->available_space = $busut->available_space;
        $busut->utilization_percentage = $busut->utilization_percentage;

        return response()->json([
            'success' => true,
            'data' => $busut
        ]);
    }

    /**
     * Create new busut
     */
    public function store(Request $request)
    {
        $request->validate([
            'zone_id' => 'required|exists:zones,id',
            'busut_number' => 'required|integer',
            'panjang' => 'nullable|numeric|min:0',
            'lebar' => 'nullable|numeric|min:0',
            'tinggi' => 'nullable|numeric|min:0',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'soil_type' => 'nullable|string',
            'soil_ph' => 'nullable|numeric|between:0,14',
            'capacity_trees' => 'nullable|integer|min:0',
            'status' => 'required|in:baik,perlu_repair,perlu_naik_tanah,baru_buat',
            'date_created' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Generate busut_code
        $zone = Zone::findOrFail($request->zone_id);
        $busutCode = sprintf('%s-%03d', $zone->code, $request->busut_number);

        $busut = Busut::create(array_merge($request->all(), [
            'busut_code' => $busutCode,
            'current_trees' => 0,
        ]));

        ActivityLog::logActivity(
            'create',
            'busut',
            $busut->id,
            "Tambah busut baru: {$busut->busut_code}",
            null,
            $busut->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Busut berjaya ditambah',
            'data' => $busut->load('zone')
        ], 201);
    }

    /**
     * Update busut
     */
    public function update(Request $request, $id)
    {
        $busut = Busut::findOrFail($id);
        $oldData = $busut->toArray();

        $request->validate([
            'panjang' => 'nullable|numeric|min:0',
            'lebar' => 'nullable|numeric|min:0',
            'tinggi' => 'nullable|numeric|min:0',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'soil_type' => 'nullable|string',
            'soil_ph' => 'nullable|numeric|between:0,14',
            'last_soil_test' => 'nullable|date',
            'capacity_trees' => 'nullable|integer|min:0',
            'status' => 'nullable|in:baik,perlu_repair,perlu_naik_tanah,baru_buat',
            'last_maintenance' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $busut->update($request->all());

        ActivityLog::logActivity(
            'update',
            'busut',
            $busut->id,
            "Kemaskini busut: {$busut->busut_code}",
            $oldData,
            $busut->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Busut berjaya dikemaskini',
            'data' => $busut->load('zone')
        ]);
    }

    /**
     * Delete busut
     */
    public function destroy($id)
    {
        $busut = Busut::findOrFail($id);

        // Check if busut has trees
        if ($busut->current_trees > 0) {
            return response()->json([
                'success' => false,
                'message' => "Tidak boleh delete busut {$busut->busut_code} kerana masih ada {$busut->current_trees} pokok"
            ], 400);
        }

        $oldData = $busut->toArray();

        ActivityLog::logActivity(
            'delete',
            'busut',
            $busut->id,
            "Padam busut: {$busut->busut_code}",
            $oldData,
            null
        );

        $busut->delete();

        return response()->json([
            'success' => true,
            'message' => 'Busut berjaya dipadam'
        ]);
    }

    /**
     * Get busut statistics
     */
    public function statistics()
    {
        $stats = [
            'total_busut' => Busut::count(),
            'by_zone' => Busut::select('zone_id', \DB::raw('count(*) as count'))
                ->with('zone:id,name,code')
                ->groupBy('zone_id')
                ->get(),
            'by_status' => Busut::select('status', \DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
            'total_capacity' => Busut::sum('capacity_trees'),
            'total_current' => Busut::sum('current_trees'),
            'average_utilization' => Busut::avg(\DB::raw('(current_trees / capacity_trees) * 100')),
            'full_busut' => Busut::whereRaw('current_trees >= capacity_trees')->count(),
            'empty_busut' => Busut::where('current_trees', 0)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get busut map data (for visualization)
     */
    public function mapData(Request $request)
    {
        $query = Busut::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with('zone:id,name,code,color_code')
            ->select([
                'id',
                'zone_id',
                'busut_code',
                'latitude',
                'longitude',
                'status',
                'current_trees',
                'capacity_trees',
            ]);

        // Filter by zone
        if ($request->has('zone_id')) {
            $query->where('zone_id', $request->zone_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $busut = $query->get()->map(function($b) {
            $b->utilization_percentage = $b->utilization_percentage;
            $b->is_full = $b->is_full;
            return $b;
        });

        return response()->json([
            'success' => true,
            'data' => $busut,
            'count' => $busut->count(),
        ]);
    }

    /**
     * Assign pokok to busut
     */
    public function assignPokok(Request $request, $id)
    {
        $busut = Busut::findOrFail($id);

        $request->validate([
            'pokok_ids' => 'required|array',
            'pokok_ids.*' => 'exists:pokok_durian,id',
        ]);

        // Check if busut has space
        $requestedCount = count($request->pokok_ids);
        if ($busut->available_space < $requestedCount) {
            return response()->json([
                'success' => false,
                'message' => "Busut hanya ada space untuk {$busut->available_space} pokok lagi"
            ], 400);
        }

        // Assign pokok
        \App\Models\PokokDurian::whereIn('id', $request->pokok_ids)
            ->update(['busut_id' => $busut->id]);

        // Update count
        $busut->updateTreeCount();

        ActivityLog::logActivity(
            'assign',
            'busut',
            $busut->id,
            "Assign {$requestedCount} pokok ke busut {$busut->busut_code}",
            null,
            ['pokok_ids' => $request->pokok_ids]
        );

        return response()->json([
            'success' => true,
            'message' => "Berjaya assign {$requestedCount} pokok ke busut {$busut->busut_code}",
            'data' => $busut->fresh()
        ]);
    }
}
