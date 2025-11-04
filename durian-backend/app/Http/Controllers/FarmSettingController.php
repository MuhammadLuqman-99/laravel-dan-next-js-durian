<?php

namespace App\Http\Controllers;

use App\Models\FarmSetting;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class FarmSettingController extends Controller
{
    public function index()
    {
        $settings = FarmSetting::current();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $settings = FarmSetting::current();
        $oldData = $settings->toArray();

        $request->validate([
            'farm_name' => 'required|string|max:255',
            'crop_type' => 'required|string',
            'crop_label_singular' => 'required|string|max:255',
            'crop_label_plural' => 'required|string|max:255',
            'unit_weight' => 'required|string|max:50',
            'unit_quantity' => 'required|string|max:50',
            'owner_name' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'address' => 'nullable|string',
        ]);

        $settings->update($request->all());

        // Log activity
        ActivityLog::logActivity(
            'update',
            'settings',
            $settings->id,
            "Kemaskini tetapan kebun: {$settings->farm_name} ({$settings->crop_type})",
            $oldData,
            $settings->fresh()->toArray()
        );

        return response()->json([
            'success' => true,
            'message' => 'Tetapan kebun berjaya dikemaskini',
            'data' => $settings,
        ]);
    }

    // Get crop presets for quick setup
    public function cropPresets()
    {
        $presets = [
            'durian' => [
                'crop_type' => 'durian',
                'crop_label_singular' => 'Pokok Durian',
                'crop_label_plural' => 'Pokok Durian',
                'unit_weight' => 'kg',
                'unit_quantity' => 'biji',
            ],
            'pisang' => [
                'crop_type' => 'pisang',
                'crop_label_singular' => 'Pokok Pisang',
                'crop_label_plural' => 'Pokok Pisang',
                'unit_weight' => 'kg',
                'unit_quantity' => 'tandan',
            ],
            'rambutan' => [
                'crop_type' => 'rambutan',
                'crop_label_singular' => 'Pokok Rambutan',
                'crop_label_plural' => 'Pokok Rambutan',
                'unit_weight' => 'kg',
                'unit_quantity' => 'biji',
            ],
            'mangga' => [
                'crop_type' => 'mangga',
                'crop_label_singular' => 'Pokok Mangga',
                'crop_label_plural' => 'Pokok Mangga',
                'unit_weight' => 'kg',
                'unit_quantity' => 'biji',
            ],
            'kelapa_sawit' => [
                'crop_type' => 'kelapa_sawit',
                'crop_label_singular' => 'Pokok Kelapa Sawit',
                'crop_label_plural' => 'Pokok Kelapa Sawit',
                'unit_weight' => 'tan',
                'unit_quantity' => 'tandan',
            ],
            'sayur' => [
                'crop_type' => 'sayur',
                'crop_label_singular' => 'Tanaman Sayur',
                'crop_label_plural' => 'Tanaman Sayur',
                'unit_weight' => 'kg',
                'unit_quantity' => 'ikat',
            ],
            'cili' => [
                'crop_type' => 'cili',
                'crop_label_singular' => 'Tanaman Cili',
                'crop_label_plural' => 'Tanaman Cili',
                'unit_weight' => 'kg',
                'unit_quantity' => 'kg',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $presets,
        ]);
    }
}
