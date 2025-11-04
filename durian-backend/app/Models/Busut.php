<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Busut extends Model
{
    use HasFactory;

    protected $table = 'busut';

    protected $fillable = [
        'zone_id',
        'busut_code',
        'busut_number',
        'panjang',
        'lebar',
        'tinggi',
        'latitude',
        'longitude',
        'soil_type',
        'soil_ph',
        'last_soil_test',
        'capacity_trees',
        'current_trees',
        'status',
        'date_created',
        'last_maintenance',
        'notes',
    ];

    protected $casts = [
        'panjang' => 'decimal:2',
        'lebar' => 'decimal:2',
        'tinggi' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'soil_ph' => 'decimal:2',
        'capacity_trees' => 'integer',
        'current_trees' => 'integer',
        'last_soil_test' => 'date',
        'date_created' => 'date',
        'last_maintenance' => 'date',
    ];

    /**
     * Get the zone that owns this busut
     */
    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * Get all pokok on this busut
     */
    public function pokok()
    {
        return $this->hasMany(PokokDurian::class);
    }

    /**
     * Get maintenance records for this busut
     */
    public function maintenanceRecords()
    {
        return $this->hasMany(BusutMaintenance::class);
    }

    /**
     * Check if busut is at capacity
     */
    public function getIsFullAttribute()
    {
        return $this->current_trees >= $this->capacity_trees;
    }

    /**
     * Get available space for more trees
     */
    public function getAvailableSpaceAttribute()
    {
        return max(0, $this->capacity_trees - $this->current_trees);
    }

    /**
     * Get utilization percentage
     */
    public function getUtilizationPercentageAttribute()
    {
        if ($this->capacity_trees == 0) return 0;
        return round(($this->current_trees / $this->capacity_trees) * 100, 2);
    }

    /**
     * Update current tree count
     */
    public function updateTreeCount()
    {
        $this->current_trees = $this->pokok()->count();
        $this->save();
    }
}
