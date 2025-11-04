<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Spray extends Model
{
    use HasFactory;

    protected $table = 'spray';

    protected $fillable = [
        'tree_id',
        'tarikh_spray',
        'jenis',
        'nama_bahan',
        'dosage',
        'interval_hari',
        'pekerja',
        'catatan',
    ];

    protected $casts = [
        'tarikh_spray' => 'date',
    ];

    public function tree()
    {
        return $this->belongsTo(PokokDurian::class, 'tree_id');
    }

    // Calculate days since spray
    public function getDaysSinceSprayAttribute()
    {
        return Carbon::parse($this->tarikh_spray)->diffInDays(Carbon::now());
    }

    // Calculate next spray date
    public function getNextSprayDateAttribute()
    {
        return Carbon::parse($this->tarikh_spray)->addDays($this->interval_hari);
    }

    // Check if overdue
    public function getIsOverdueAttribute()
    {
        return $this->next_spray_date->isPast();
    }

    // Get status color
    public function getStatusAttribute()
    {
        $daysLeft = Carbon::now()->diffInDays($this->next_spray_date, false);

        if ($daysLeft < 0) {
            return 'overdue'; // Red - already overdue
        } elseif ($daysLeft <= 3) {
            return 'due-soon'; // Yellow - due in 3 days
        } else {
            return 'ok'; // Green - still good
        }
    }
}
