<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class DoctorProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'license_number',
        'specialty',
        'institution',
        'location',
        'segment',
        'stance',
        'access_difficulty',
        'difficulty_multiplier',
        'years_of_experience',
        'bio',
        'needs_cross_functional_support',
        'cross_functional_departments',
    ];

    protected function casts(): array
    {
        return [
            'difficulty_multiplier' => 'decimal:2',
            'years_of_experience' => 'integer',
            'needs_cross_functional_support' => 'boolean',
        ];
    }

    // -----------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }

    public function openLoops(): HasManyThrough
    {
        return $this->hasManyThrough(
            NextStep::class,
            Visit::class,
        )->where('next_steps.is_completed', false);
    }

    // -----------------------------------------------------------
    // Accessors
    // -----------------------------------------------------------

    /**
     * Full doctor name with title.
     */
    public function getDisplayNameAttribute(): string
    {
        return 'Dr. '.($this->user->name ?? 'Unknown');
    }

    /**
     * Numeric difficulty multiplier based on access_difficulty.
     */
    public static function difficultyMultiplierFor(string $difficulty): float
    {
        return match ($difficulty) {
            'C' => 0.90,
            'B' => 1.00,
            'A' => 1.15,
            default => 1.00,
        };
    }

    // -----------------------------------------------------------
    // Scopes
    // -----------------------------------------------------------

    public function scopeBySegment($query, string $segment)
    {
        return $query->where('segment', $segment);
    }
}
