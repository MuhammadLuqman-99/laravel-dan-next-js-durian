<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'total_busut',
        'total_area_hectares',
        'color_code',
    ];

    protected $casts = [
        'total_busut' => 'integer',
        'total_area_hectares' => 'decimal:2',
    ];

    /**
     * Get all busut in this zone
     */
    public function busut()
    {
        return $this->hasMany(Busut::class);
    }

    /**
     * Get all pokok in this zone (through busut)
     */
    public function pokok()
    {
        return $this->hasManyThrough(PokokDurian::class, Busut::class);
    }

    /**
     * Get statistics for this zone
     */
    public function getStatisticsAttribute()
    {
        return [
            'total_busut' => $this->busut()->count(),
            'total_pokok' => $this->pokok()->count(),
            'busut_status' => $this->busut()
                ->select('status', \DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status'),
        ];
    }
}
