<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'farm_name',
        'crop_type',
        'crop_label_singular',
        'crop_label_plural',
        'unit_weight',
        'unit_quantity',
        'owner_name',
        'contact_number',
        'address',
    ];

    // Get the active farm settings (there should only be one row)
    public static function current()
    {
        return self::first() ?? self::create([
            'farm_name' => 'Kebun Saya',
            'crop_type' => 'durian',
            'crop_label_singular' => 'Pokok',
            'crop_label_plural' => 'Pokok',
            'unit_weight' => 'kg',
            'unit_quantity' => 'biji',
        ]);
    }
}
