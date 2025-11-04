<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hasil extends Model
{
    use HasFactory;

    protected $table = 'hasil';

    protected $fillable = [
        'tree_id',
        'tarikh_tuai',
        'jumlah_biji',
        'berat_kg',
        'kualiti',
        'catatan',
    ];

    protected $casts = [
        'tarikh_tuai' => 'date',
        'berat_kg' => 'decimal:2',
    ];

    // Relationships
    public function tree()
    {
        return $this->belongsTo(PokokDurian::class, 'tree_id');
    }
}
