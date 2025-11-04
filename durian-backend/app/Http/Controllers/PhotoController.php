<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PhotoController extends Controller
{
    /**
     * Upload photo(s) for a model
     */
    public function upload(Request $request)
    {
        $request->validate([
            'photoable_type' => 'required|string',
            'photoable_id' => 'required|integer',
            'photos' => 'required|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // Max 5MB
            'captions' => 'nullable|array',
            'captions.*' => 'nullable|string|max:500',
        ]);

        $uploadedPhotos = [];
        $photos = $request->file('photos');
        $captions = $request->input('captions', []);

        foreach ($photos as $index => $photo) {
            // Generate unique filename
            $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();

            // Store in public disk under photos directory
            $path = $photo->storeAs('photos', $filename, 'public');

            // Create photo record
            $photoRecord = Photo::create([
                'photoable_type' => $request->photoable_type,
                'photoable_id' => $request->photoable_id,
                'file_path' => $path,
                'file_name' => $photo->getClientOriginalName(),
                'mime_type' => $photo->getMimeType(),
                'file_size' => $photo->getSize(),
                'caption' => $captions[$index] ?? null,
                'uploaded_by' => auth()->id(),
            ]);

            $uploadedPhotos[] = $photoRecord;
        }

        activity()
            ->causedBy(auth()->user())
            ->log('Uploaded ' . count($uploadedPhotos) . ' photo(s) for ' . $request->photoable_type);

        return response()->json([
            'message' => 'Photo(s) uploaded successfully',
            'photos' => $uploadedPhotos
        ], 201);
    }

    /**
     * Get photos for a model
     */
    public function index(Request $request)
    {
        $request->validate([
            'photoable_type' => 'required|string',
            'photoable_id' => 'required|integer',
        ]);

        $photos = Photo::where('photoable_type', $request->photoable_type)
            ->where('photoable_id', $request->photoable_id)
            ->with('uploader:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($photos);
    }

    /**
     * Delete a photo
     */
    public function destroy($id)
    {
        $photo = Photo::findOrFail($id);

        // Check if user is admin or the uploader
        if (auth()->user()->role !== 'admin' && $photo->uploaded_by !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete file from storage
        if (Storage::disk('public')->exists($photo->file_path)) {
            Storage::disk('public')->delete($photo->file_path);
        }

        // Delete record
        $photo->delete();

        activity()
            ->causedBy(auth()->user())
            ->log('Deleted photo: ' . $photo->file_name);

        return response()->json(['message' => 'Photo deleted successfully']);
    }

    /**
     * Update photo caption
     */
    public function updateCaption(Request $request, $id)
    {
        $request->validate([
            'caption' => 'nullable|string|max:500',
        ]);

        $photo = Photo::findOrFail($id);

        // Check if user is admin or the uploader
        if (auth()->user()->role !== 'admin' && $photo->uploaded_by !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $photo->update([
            'caption' => $request->caption
        ]);

        return response()->json([
            'message' => 'Caption updated successfully',
            'photo' => $photo
        ]);
    }
}
