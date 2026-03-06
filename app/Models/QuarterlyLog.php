<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuarterlyLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'subject_type',
        'subject_id',
        'subject_name',
        'priority',
        'quarter',
        'details',
        'reviewed',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    protected $casts = [
        'details' => 'array',
        'reviewed' => 'boolean',
        'reviewed_at' => 'datetime',
    ];

    // -----------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // -----------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------

    /**
     * Get current quarter string, e.g. "2026-Q1"
     */
    public static function currentQuarter(): string
    {
        $month = (int) now()->format('n');
        $q = (int) ceil($month / 3);

        return now()->format('Y').'-Q'.$q;
    }

    /**
     * Log a quarterly activity.
     */
    public static function record(
        string $action,
        ?Model $subject = null,
        ?string $subjectName = null,
        string $priority = 'normal',
        ?array $details = null,
    ): static {
        return static::create([
            'user_id' => auth()->id(),
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->getKey(),
            'subject_name' => $subjectName,
            'priority' => $priority,
            'quarter' => static::currentQuarter(),
            'details' => $details,
        ]);
    }

    // -----------------------------------------------------------
    // Scopes
    // -----------------------------------------------------------

    public function scopeForQuarter($query, string $quarter)
    {
        return $query->where('quarter', $quarter);
    }

    public function scopeUnreviewed($query)
    {
        return $query->where('reviewed', false);
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Mark this log as reviewed.
     */
    public function markReviewed(?string $notes = null): void
    {
        $this->update([
            'reviewed' => true,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
            'review_notes' => $notes,
        ]);
    }
}
