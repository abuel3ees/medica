<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Visit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'rep_id',
        'doctor_profile_id',
        'visit_type',
        'visit_date',
        'notes',
        'engagement_quality',
        'access_difficulty',
        'time_spent_minutes',
        'time_goal_status',
        'confidence',
        'stance_before',
        'stance_after',
        'efficiency_score',
        'raw_outcome_score',
        'progress_bonus',
        'difficulty_multiplier',
        'time_factor',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
            'time_spent_minutes' => 'integer',
            'confidence' => 'integer',
            'efficiency_score' => 'decimal:3',
            'raw_outcome_score' => 'decimal:3',
            'progress_bonus' => 'decimal:3',
            'difficulty_multiplier' => 'decimal:2',
            'time_factor' => 'decimal:3',
        ];
    }

    // -----------------------------------------------------------
    // Relationships
    // -----------------------------------------------------------

    public function rep(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rep_id');
    }

    public function doctorProfile(): BelongsTo
    {
        return $this->belongsTo(DoctorProfile::class);
    }

    public function visitObjectives(): HasMany
    {
        return $this->hasMany(VisitObjective::class);
    }

    public function objectives(): BelongsToMany
    {
        return $this->belongsToMany(Objective::class, 'visit_objectives')
            ->withPivot('outcome', 'outcome_score')
            ->withTimestamps();
    }

    public function nextSteps(): HasMany
    {
        return $this->hasMany(NextStep::class);
    }

    public function objectionTags(): BelongsToMany
    {
        return $this->belongsToMany(ObjectionTag::class, 'visit_objection_tag');
    }

    // -----------------------------------------------------------
    // Accessors
    // -----------------------------------------------------------

    /**
     * Returns human-readable visit type.
     */
    public function getVisitTypeLabelAttribute(): string
    {
        return match ($this->visit_type) {
            'in_person' => 'In-Person',
            'call' => 'Call',
            'event' => 'Event',
            'follow_up' => 'Follow-Up',
            default => ucfirst(str_replace('_', ' ', $this->visit_type)),
        };
    }

    // -----------------------------------------------------------
    // Scopes
    // -----------------------------------------------------------

    public function scopeForRep($query, int $repId)
    {
        return $query->where('rep_id', $repId);
    }

    public function scopeForDoctor($query, int $doctorProfileId)
    {
        return $query->where('doctor_profile_id', $doctorProfileId);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('visit_date', '>=', now()->subDays($days));
    }
}
