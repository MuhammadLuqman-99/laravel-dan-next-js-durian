<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PokokDurian extends Model
{
    use HasFactory;

    protected $table = 'pokok_durian';

    protected $fillable = [
        'tag_no',
        'varieti',
        'umur',
        'lokasi',
        'latitude',
        'longitude',
        'gps_accuracy',
        'gps_captured_at',
        'tarikh_tanam',
        'status_kesihatan',
        'catatan',
    ];

    protected $casts = [
        'tarikh_tanam' => 'date',
    ];

    // Relationships
    public function bajaRecords()
    {
        return $this->hasMany(Baja::class, 'tree_id');
    }

    public function hasilRecords()
    {
        return $this->hasMany(Hasil::class, 'tree_id');
    }

    public function inspeksiRecords()
    {
        return $this->hasMany(Inspeksi::class, 'tree_id');
    }

    public function sprayRecords()
    {
        return $this->hasMany(Spray::class, 'tree_id');
    }

    public function photos()
    {
        return $this->morphMany(Photo::class, 'photoable');
    }

    public function busut()
    {
        return $this->belongsTo(Busut::class);
    }

    // Accessors
    public function getLatestInspeksiAttribute()
    {
        return $this->inspeksiRecords()->latest('tarikh_inspeksi')->first();
    }

    public function getLatestSprayAttribute()
    {
        return $this->sprayRecords()->latest('tarikh_spray')->first();
    }

    public function getTotalHasilAttribute()
    {
        return $this->hasilRecords()->sum('berat_kg');
    }
}
