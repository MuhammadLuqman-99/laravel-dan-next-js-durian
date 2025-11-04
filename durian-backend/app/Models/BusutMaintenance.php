<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusutMaintenance extends Model
{
    use HasFactory;

    protected $table = 'busut_maintenance';

    protected $fillable = [
        'busut_id',
        'user_id',
        'maintenance_type',
        'tarikh',
        'findings',
        'actions_taken',
        'cost',
        'ph_level',
        'nitrogen',
        'phosphorus',
        'potassium',
        'recommendations',
    ];

    protected $casts = [
        'tarikh' => 'date',
        'cost' => 'decimal:2',
        'ph_level' => 'decimal:2',
        'nitrogen' => 'decimal:2',
        'phosphorus' => 'decimal:2',
        'potassium' => 'decimal:2',
    ];

    /**
     * Get the busut that owns this maintenance record
     */
    public function busut()
    {
        return $this->belongsTo(Busut::class);
    }

    /**
     * Get the user who performed the maintenance
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
