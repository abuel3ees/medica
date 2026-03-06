<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NextStep extends Model
{
    protected $fillable = [
        'visit_id',
        'description',
        'type',
        'due_date',
        'is_completed',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'is_completed' => 'boolean',
            'completed_at' => 'datetime',
        ];
    }

    // -----------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    // -----------------------------------------------------------
    // Scopes
    // -----------------------------------------------------------

    public function scopeOpen($query)
    {
        return $query->where('is_completed', false);
    }

    public function scopeOverdue($query)
    {
        return $query->open()->where('due_date', '<', now()->toDateString());
    }

    // -----------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------

    public function markComplete(): void
    {
        $this->update([
            'is_completed' => true,
            'completed_at' => now(),
        ]);
    }
}
