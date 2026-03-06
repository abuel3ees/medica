<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitObjective extends Model
{
    protected $fillable = [
        'visit_id',
        'objective_id',
        'outcome',
        'outcome_score',
    ];

    protected function casts(): array
    {
        return [
            'outcome_score' => 'decimal:2',
        ];
    }

    // -----------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function objective(): BelongsTo
    {
        return $this->belongsTo(Objective::class);
    }

    // -----------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------

    /**
     * Convert outcome enum to numeric score.
     */
    public static function scoreForOutcome(string $outcome): float
    {
        return match ($outcome) {
            'met' => 1.0,
            'partially_met' => 0.5,
            'not_met' => 0.0,
            default => 0.0,
        };
    }
}
