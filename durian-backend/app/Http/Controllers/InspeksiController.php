<?php

namespace App\Http\Controllers;

use App\Models\Inspeksi;
use App\Traits\PaginationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InspeksiController extends Controller
{
    use PaginationTrait;

    public function index(Request $request)
    {
        $query = Inspeksi::with('tree');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by tree
        if ($request->has('tree_id')) {
            $query->where('tree_id', $request->tree_id);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('tarikh_inspeksi', [$request->start_date, $request->end_date]);
        }

        $inspeksi = $query->latest('tarikh_inspeksi')->paginate($this->getPaginationSize($request));

        return response()->json([
            'success' => true,
            'data' => $inspeksi,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tree_id' => 'required|exists:pokok_durian,id',
            'tarikh_inspeksi' => 'required|date',
            'pemeriksa' => 'required|string',
            'status' => 'required|in:sihat,sederhana,kurang sihat,kritikal',
            'tindakan' => 'nullable|string',
            'gambar' => 'nullable|image|max:2048',
        ]);

        $data = $request->except('gambar');

        // Handle image upload
        if ($request->hasFile('gambar')) {
            $path = $request->file('gambar')->store('inspeksi', 'public');
            $data['gambar'] = $path;
        }

        $inspeksi = Inspeksi::create($data);
        $inspeksi->load('tree');

        // Update tree health status based on latest inspection
        $inspeksi->tree->update([
            'status_kesihatan' => $request->status
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rekod inspeksi berjaya ditambah',
            'data' => $inspeksi,
        ], 201);
    }

    public function show($id)
    {
        $inspeksi = Inspeksi::with('tree')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $inspeksi,
        ]);
    }

    public function update(Request $request, $id)
    {
        $inspeksi = Inspeksi::findOrFail($id);

        $request->validate([
            'tree_id' => 'required|exists:pokok_durian,id',
            'tarikh_inspeksi' => 'required|date',
            'pemeriksa' => 'required|string',
            'status' => 'required|in:sihat,sederhana,kurang sihat,kritikal',
            'tindakan' => 'nullable|string',
            'gambar' => 'nullable|image|max:2048',
        ]);

        $data = $request->except('gambar');

        // Handle image upload
        if ($request->hasFile('gambar')) {
            // Delete old image
            if ($inspeksi->gambar) {
                Storage::disk('public')->delete($inspeksi->gambar);
            }
            $path = $request->file('gambar')->store('inspeksi', 'public');
            $data['gambar'] = $path;
        }

        $inspeksi->update($data);
        $inspeksi->load('tree');

        return response()->json([
            'success' => true,
            'message' => 'Rekod inspeksi berjaya dikemaskini',
            'data' => $inspeksi,
        ]);
    }

    public function destroy($id)
    {
        $inspeksi = Inspeksi::findOrFail($id);

        // Delete image if exists
        if ($inspeksi->gambar) {
            Storage::disk('public')->delete($inspeksi->gambar);
        }

        $inspeksi->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rekod inspeksi berjaya dipadam',
        ]);
    }

    public function latestInspections()
    {
        $inspeksi = Inspeksi::with('tree')
            ->latest('tarikh_inspeksi')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $inspeksi,
        ]);
    }
}
