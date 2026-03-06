<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Objective extends Model
{
    protected $fillable = [
        'name',
        'category',
        'importance',
        'weight',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'weight' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    // -----------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------

    public function visitObjectives(): HasMany
    {
        return $this->hasMany(VisitObjective::class);
    }

    // -----------------------------------------------------------
    // Scopes
    // -----------------------------------------------------------

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // -----------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------

    /**
     * Return the numeric weight based on importance level.
     */
    public static function weightForImportance(string $importance): float
    {
        return match ($importance) {
            'high' => 1.30,
            'standard' => 1.00,
            'low' => 0.70,
            default => 1.00,
        };
    }
}
