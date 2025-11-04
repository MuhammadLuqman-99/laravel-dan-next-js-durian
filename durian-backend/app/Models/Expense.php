<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'tarikh',
        'kategori',
        'item',
        'kuantiti',
        'unit',
        'harga_seunit',
        'jumlah',
        'pembekal',
        'catatan',
        'resit',
    ];

    protected $casts = [
        'tarikh' => 'date',
        'harga_seunit' => 'decimal:2',
        'jumlah' => 'decimal:2',
    ];

    // Auto-calculate jumlah before saving
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($expense) {
            $expense->jumlah = $expense->kuantiti * $expense->harga_seunit;
        });
    }
}
