<?php

namespace App\Http\Controllers;

use App\Models\PokokDurian;
use App\Models\ActivityLog;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Barryvdh\DomPDF\Facade\Pdf;

class PokokDurianController extends Controller
{
    use PaginationTrait;

    public function index(Request $request)
    {
        $query = PokokDurian::with(['inspeksiRecords' => function($q) {
            $q->latest('tarikh_inspeksi')->limit(1);
        }]);

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('tag_no', 'like', "%{$search}%")
                  ->orWhere('varieti', 'like', "%{$search}%")
                  ->orWhere('lokasi', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status_kesihatan', $request->status);
        }

        $pokok = $query->latest()->paginate($this->getPaginationSize($request));

        return response()->json([
            'success' => true,
            'data' => $pokok,
        ]);
    }

    public function store(Request $request)
    {
        // Check if user has permission (admin only)
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can create records.',
            ], 403);
        }

        $request->validate([
            'tag_no' => 'required|string|unique:pokok_durian,tag_no',
            'varieti' => 'required|string',
            'umur' => 'required|integer|min:0',
            'lokasi' => 'required|string',
            'tarikh_tanam' => 'required|date',
            'status_kesihatan' => 'required|in:sihat,sederhana,kurang sihat,kritikal',
            'catatan' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'gps_accuracy' => 'nullable|string',
            'gps_captured_at' => 'nullable|date',
        ]);

        $pokok = PokokDurian::create($request->all());

        // Log activity
        ActivityLog::logActivity(
            'create',
            'pokok',
            $pokok->id,
            "Tambah pokok baru: {$pokok->tag_no} - {$pokok->varieti}",
            null,
            $pokok->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Pokok durian berjaya ditambah',
            'data' => $pokok,
        ], 201);
    }

    public function show($id)
    {
        $pokok = PokokDurian::with(['bajaRecords.pekerja', 'hasilRecords', 'inspeksiRecords'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $pokok,
        ]);
    }

    public function update(Request $request, $id)
    {
        // Check if user has permission (admin only)
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can update records.',
            ], 403);
        }

        $pokok = PokokDurian::findOrFail($id);
        $oldData = $pokok->toArray();

        $request->validate([
            'tag_no' => 'required|string|unique:pokok_durian,tag_no,' . $id,
            'varieti' => 'required|string',
            'umur' => 'required|integer|min:0',
            'lokasi' => 'required|string',
            'tarikh_tanam' => 'required|date',
            'status_kesihatan' => 'required|in:sihat,sederhana,kurang sihat,kritikal',
            'catatan' => 'nullable|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'gps_accuracy' => 'nullable|string',
            'gps_captured_at' => 'nullable|date',
        ]);

        $pokok->update($request->all());

        // Log activity
        ActivityLog::logActivity(
            'update',
            'pokok',
            $pokok->id,
            "Kemaskini pokok: {$pokok->tag_no}",
            $oldData,
            $pokok->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Pokok durian berjaya dikemaskini',
            'data' => $pokok,
        ]);
    }

    public function destroy($id)
    {
        // Check if user has permission (admin only)
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can delete records.',
            ], 403);
        }

        $pokok = PokokDurian::findOrFail($id);
        $oldData = $pokok->toArray();

        // Log activity before deleting
        ActivityLog::logActivity(
            'delete',
            'pokok',
            $pokok->id,
            "Padam pokok: {$pokok->tag_no} - {$pokok->varieti}",
            $oldData,
            null
        );

        $pokok->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pokok durian berjaya dipadam',
        ]);
    }

    public function statistics()
    {
        $stats = [
            'total_pokok' => PokokDurian::count(),
            'pokok_sihat' => PokokDurian::where('status_kesihatan', 'sihat')->count(),
            'pokok_kritikal' => PokokDurian::where('status_kesihatan', 'kritikal')->count(),
            'by_varieti' => PokokDurian::selectRaw('varieti, count(*) as count')
                ->groupBy('varieti')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get all trees with GPS coordinates for map display
     */
    public function mapData(Request $request)
    {
        $query = PokokDurian::whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select([
                'id',
                'tag_no',
                'varieti',
                'lokasi',
                'latitude',
                'longitude',
                'status_kesihatan',
                'umur',
                'tarikh_tanam'
            ]);

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status_kesihatan', $request->status);
        }

        // Filter by varieti if provided
        if ($request->has('varieti')) {
            $query->where('varieti', $request->varieti);
        }

        $trees = $query->get();

        return response()->json([
            'success' => true,
            'data' => $trees,
            'count' => $trees->count(),
        ]);
    }

    public function generateQrCode($id)
    {
        $pokok = PokokDurian::findOrFail($id);

        // Generate URL yang akan di-encode dalam QR code
        $url = config('app.frontend_url', 'http://localhost:5173') . '/pokok/' . $pokok->id;

        // Generate QR code as SVG
        $qrCode = QrCode::size(300)
            ->margin(2)
            ->format('svg')
            ->generate($url);

        return response($qrCode)
            ->header('Content-Type', 'image/svg+xml');
    }

    /**
     * Print label for a single tree
     */
    public function printLabel(Request $request, $id)
    {
        $request->validate([
            'size' => 'nullable|in:small,medium,large',
            'include_qr' => 'nullable|boolean',
        ]);

        $tree = PokokDurian::findOrFail($id);
        $size = $request->input('size', 'medium');
        $includeQR = $request->input('include_qr', true);

        // Generate QR code as base64 image if needed
        $qrCode = null;
        if ($includeQR) {
            $url = config('app.frontend_url', 'http://localhost:5173') . '/pokok/' . $tree->id;
            $qrCode = base64_encode(QrCode::format('png')->size(200)->generate($url));
            $qrCode = 'data:image/png;base64,' . $qrCode;
        }

        $data = [
            'tree' => $tree,
            'size' => $size,
            'includeQR' => $includeQR,
            'qrCode' => $qrCode,
            'farmName' => config('app.name', 'Sistem Kebun Durian'),
        ];

        $pdf = PDF::loadView('labels.tree-label', $data);
        $pdf->setPaper(
            $size === 'small' ? [0, 0, 198.43, 141.73] : // 70mm x 50mm
            ($size === 'medium' ? [0, 0, 283.46, 198.43] : // 100mm x 70mm
            [0, 0, 419.53, 297.64]), // 148mm x 105mm (A6)
            'landscape'
        );

        activity()
            ->causedBy(auth()->user())
            ->performedOn($tree)
            ->log('Printed label for tree: ' . $tree->tag_no);

        return $pdf->stream('label-' . $tree->tag_no . '.pdf');
    }

    /**
     * Print labels for multiple trees (batch)
     */
    public function printBatchLabels(Request $request)
    {
        $request->validate([
            'tree_ids' => 'required|array',
            'tree_ids.*' => 'exists:pokok_durian,id',
            'include_qr' => 'nullable|boolean',
            'columns' => 'nullable|integer|min:1|max:4',
            'rows' => 'nullable|integer|min:1|max:10',
        ]);

        $treeIds = $request->input('tree_ids');
        $includeQR = $request->input('include_qr', true);
        $columns = $request->input('columns', 3);
        $rows = $request->input('rows', 5);

        $trees = PokokDurian::whereIn('id', $treeIds)->get();

        // Generate QR codes for all trees if needed
        $qrCodes = [];
        if ($includeQR) {
            foreach ($trees as $tree) {
                $url = config('app.frontend_url', 'http://localhost:5173') . '/pokok/' . $tree->id;
                $qrBase64 = base64_encode(QrCode::format('png')->size(150)->generate($url));
                $qrCodes[$tree->id] = 'data:image/png;base64,' . $qrBase64;
            }
        }

        $data = [
            'trees' => $trees,
            'includeQR' => $includeQR,
            'qrCodes' => $qrCodes,
            'columns' => $columns,
            'rows' => $rows,
            'farmName' => config('app.name', 'Sistem Kebun'),
        ];

        $pdf = PDF::loadView('labels.batch-labels', $data);
        $pdf->setPaper('A4');

        activity()
            ->causedBy(auth()->user())
            ->log('Printed batch labels for ' . count($trees) . ' trees');

        return $pdf->stream('batch-labels-' . date('Ymd-His') . '.pdf');
    }

    /**
     * Print labels for all trees (or filtered)
     */
    public function printAllLabels(Request $request)
    {
        $request->validate([
            'status' => 'nullable|in:sihat,sederhana,kurang sihat,kritikal',
            'include_qr' => 'nullable|boolean',
            'columns' => 'nullable|integer|min:1|max:4',
            'rows' => 'nullable|integer|min:1|max:10',
        ]);

        $query = PokokDurian::query();

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status_kesihatan', $request->status);
        }

        $trees = $query->orderBy('tag_no')->get();

        if ($trees->isEmpty()) {
            return response()->json(['message' => 'No trees found'], 404);
        }

        $includeQR = $request->input('include_qr', false); // Default false for all trees
        $columns = $request->input('columns', 3);
        $rows = $request->input('rows', 5);

        // Generate QR codes if needed
        $qrCodes = [];
        if ($includeQR) {
            foreach ($trees as $tree) {
                $url = config('app.frontend_url', 'http://localhost:5173') . '/pokok/' . $tree->id;
                $qrBase64 = base64_encode(QrCode::format('png')->size(150)->generate($url));
                $qrCodes[$tree->id] = 'data:image/png;base64,' . $qrBase64;
            }
        }

        $data = [
            'trees' => $trees,
            'includeQR' => $includeQR,
            'qrCodes' => $qrCodes,
            'columns' => $columns,
            'rows' => $rows,
            'farmName' => config('app.name', 'Sistem Kebun'),
        ];

        $pdf = PDF::loadView('labels.batch-labels', $data);
        $pdf->setPaper('A4');

        activity()
            ->causedBy(auth()->user())
            ->log('Printed all labels (' . count($trees) . ' trees)');

        return $pdf->stream('all-labels-' . date('Ymd-His') . '.pdf');
    }

    /**
     * Bulk update status for multiple trees
     */
    public function bulkUpdateStatus(Request $request)
    {
        // Check if user has permission (admin only)
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can update records.',
            ], 403);
        }

        $request->validate([
            'tree_ids' => 'required|array',
            'tree_ids.*' => 'exists:pokok_durian,id',
            'status_kesihatan' => 'required|in:sihat,sederhana,kurang sihat,kritikal',
        ]);

        $treeIds = $request->input('tree_ids');
        $status = $request->input('status_kesihatan');

        $trees = PokokDurian::whereIn('id', $treeIds)->get();
        $updatedCount = 0;

        foreach ($trees as $tree) {
            $oldStatus = $tree->status_kesihatan;
            $tree->update(['status_kesihatan' => $status]);
            $updatedCount++;

            // Log activity for each tree
            ActivityLog::logActivity(
                'update',
                'pokok',
                $tree->id,
                "Bulk update status: {$tree->tag_no} dari {$oldStatus} ke {$status}",
                ['status_kesihatan' => $oldStatus],
                ['status_kesihatan' => $status]
            );
        }

        return response()->json([
            'success' => true,
            'message' => "Berjaya update {$updatedCount} pokok ke status: {$status}",
            'updated_count' => $updatedCount,
        ]);
    }

    /**
     * Bulk delete multiple trees
     */
    public function bulkDelete(Request $request)
    {
        // Check if user has permission (admin only)
        if (auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admin can delete records.',
            ], 403);
        }

        $request->validate([
            'tree_ids' => 'required|array',
            'tree_ids.*' => 'exists:pokok_durian,id',
        ]);

        $treeIds = $request->input('tree_ids');
        $trees = PokokDurian::whereIn('id', $treeIds)->get();
        $deletedCount = 0;

        foreach ($trees as $tree) {
            $oldData = $tree->toArray();

            // Log activity before deleting
            ActivityLog::logActivity(
                'delete',
                'pokok',
                $tree->id,
                "Bulk delete: {$tree->tag_no} - {$tree->varieti}",
                $oldData,
                null
            );

            $tree->delete();
            $deletedCount++;
        }

        return response()->json([
            'success' => true,
            'message' => "Berjaya delete {$deletedCount} pokok",
            'deleted_count' => $deletedCount,
        ]);
    }

    /**
     * Export trees to CSV
     */
    public function export(Request $request)
    {
        $request->validate([
            'ids' => 'nullable|string', // comma-separated IDs
        ]);

        $query = PokokDurian::query();

        // If specific IDs provided, filter by them
        if ($request->has('ids')) {
            $ids = explode(',', $request->input('ids'));
            $query->whereIn('id', $ids);
        }

        $trees = $query->orderBy('tag_no')->get();

        // Create CSV content
        $csvData = [];

        // Header row
        $csvData[] = [
            'Tag No',
            'Varieti',
            'Umur (tahun)',
            'Lokasi',
            'Tarikh Tanam',
            'Status Kesihatan',
            'Latitude',
            'Longitude',
            'Catatan',
        ];

        // Data rows
        foreach ($trees as $tree) {
            $csvData[] = [
                $tree->tag_no,
                $tree->varieti,
                $tree->umur,
                $tree->lokasi,
                $tree->tarikh_tanam,
                $tree->status_kesihatan,
                $tree->latitude ?? '',
                $tree->longitude ?? '',
                $tree->catatan ?? '',
            ];
        }

        // Convert to CSV string
        $output = fopen('php://temp', 'r+');
        foreach ($csvData as $row) {
            fputcsv($output, $row);
        }
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        // Log activity
        ActivityLog::logActivity(
            'export',
            'pokok',
            null,
            'Export data pokok ke CSV (' . count($trees) . ' rekod)',
            null,
            ['count' => count($trees)]
        );

        return response($csv, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="pokok-durian-' . date('Y-m-d') . '.csv"');
    }
}
