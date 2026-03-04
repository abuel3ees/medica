<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Medication extends Model
{
    protected $fillable = [
        'name',
        'generic_name',
        'description',
        'indications',
        'dosage',
        'side_effects',
        'contraindications',
        'pdf_path',
        'extracted_text',
        'uploaded_by',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
