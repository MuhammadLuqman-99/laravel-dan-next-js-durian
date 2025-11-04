<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Baja extends Model
{
    use HasFactory;

    protected $table = 'baja';

    protected $fillable = [
        'tree_id',
        'tarikh_baja',
        'jenis_baja',
        'jumlah',
        'pekerja_id',
        'catatan',
    ];

    protected $casts = [
        'tarikh_baja' => 'date',
        'jumlah' => 'decimal:2',
    ];

    // Relationships
    public function tree()
    {
        return $this->belongsTo(PokokDurian::class, 'tree_id');
    }

    public function pekerja()
    {
        return $this->belongsTo(User::class, 'pekerja_id');
    }
}
