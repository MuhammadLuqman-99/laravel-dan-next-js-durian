<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'tarikh_jual',
        'nama_pembeli',
        'no_telefon',
        'jumlah_biji',
        'berat_kg',
        'gred',
        'harga_sekg',
        'jumlah_harga',
        'status_bayaran',
        'jumlah_dibayar',
        'catatan',
    ];

    protected $casts = [
        'tarikh_jual' => 'date',
        'berat_kg' => 'decimal:2',
        'harga_sekg' => 'decimal:2',
        'jumlah_harga' => 'decimal:2',
        'jumlah_dibayar' => 'decimal:2',
    ];

    // Auto-calculate jumlah_harga before saving
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($sale) {
            $sale->jumlah_harga = $sale->berat_kg * $sale->harga_sekg;

            // If jumlah_dibayar not set, default to jumlah_harga for paid status
            if ($sale->status_bayaran === 'paid' && $sale->jumlah_dibayar == 0) {
                $sale->jumlah_dibayar = $sale->jumlah_harga;
            }
        });
    }

    // Calculate balance due
    public function getBalanceDueAttribute()
    {
        return $this->jumlah_harga - $this->jumlah_dibayar;
    }
}
