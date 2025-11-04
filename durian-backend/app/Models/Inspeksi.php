<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inspeksi extends Model
{
    use HasFactory;

    protected $table = 'inspeksi';

    protected $fillable = [
        'tree_id',
        'tarikh_inspeksi',
        'pemeriksa',
        'status',
        'tindakan',
        'gambar',
    ];

    protected $casts = [
        'tarikh_inspeksi' => 'date',
    ];

    // Relationships
    public function tree()
    {
        return $this->belongsTo(PokokDurian::class, 'tree_id');
    }

    public function photos()
    {
        return $this->morphMany(Photo::class, 'photoable');
    }
}
