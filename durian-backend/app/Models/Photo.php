<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    protected $fillable = [
        'photoable_type',
        'photoable_id',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'caption',
        'uploaded_by'
    ];

    protected $appends = ['url'];

    // Polymorphic relationship
    public function photoable(): MorphTo
    {
        return $this->morphTo();
    }

    // User who uploaded
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // Get full URL for the photo
    public function getUrlAttribute()
    {
        return url('storage/' . $this->file_path);
    }
}
