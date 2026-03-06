<?php

namespace App\Services;

use App\Models\DoctorProfile;
use App\Models\Visit;
use App\Models\VisitObjective;
use Illuminate\Support\Collection;

class EfficiencyScoreService
{
    /**
     * Calculate and persist the efficiency score for a single visit.
     *
     * Formula:
     *   [(Σ (OutcomeScore × ObjectiveWeight)) / (Σ ObjectiveWeight) + ProgressBonus]
     *     × DifficultyMultiplier ÷ TimeFactor
     */
    public function calculateVisitScore(Visit $visit): float
    {
        $visit->loadMissing(['visitObjectives.objective', 'doctorProfile']);

        // 1. Weighted outcome score
        $rawOutcome = $this->computeWeightedOutcome($visit->visitObjectives);

        // 2. Progress bonus
        $progressBonus = $this->computeProgressBonus($visit);

        // 3. Difficulty multiplier
        $difficultyMultiplier = $this->computeDifficultyMultiplier($visit);

        // 4. Time factor
        $timeFactor = $this->computeTimeFactor($visit->time_spent_minutes, $visit->time_goal_status);

        // 5. Confidence adjustment (optional – reduce score slightly when unsure)
        $confidenceAdjustment = $this->computeConfidenceAdjustment($visit->confidence);

        // 6. Cross-functional support bonus (+1.0 when doctor needs it)
        $crossFunctionalBonus = $this->computeCrossFunctionalBonus($visit);

        // Final score
        $score = (($rawOutcome + $progressBonus) * $difficultyMultiplier / $timeFactor) * $confidenceAdjustment + $crossFunctionalBonus;

        // Clamp to 0…2.0 reasonable range (normalized)
        $score = max(0, round($score, 3));

        // Persist cached scores
        $visit->update([
            'raw_outcome_score'    => round($rawOutcome, 3),
            'progress_bonus'       => round($progressBonus, 3),
            'difficulty_multiplier' => round($difficultyMultiplier, 2),
            'time_factor'          => round($timeFactor, 3),
            'efficiency_score'     => $score,
        ]);

        return $score;
    }

    /**
     * Weighted average: Σ(outcomeScore × objectiveWeight) / Σ(objectiveWeight)
     */
    protected function computeWeightedOutcome(Collection $visitObjectives): float
    {
        if ($visitObjectives->isEmpty()) {
            return 0;
        }

        $totalWeightedScore = 0;
        $totalWeight = 0;

        foreach ($visitObjectives as $vo) {
            $weight = $vo->objective?->weight ?? 1.0;
            $totalWeightedScore += $vo->outcome_score * $weight;
            $totalWeight += $weight;
        }

        return $totalWeight > 0 ? $totalWeightedScore / $totalWeight : 0;
    }

    /**
     * Progress bonus for stance changes and follow-through.
     */
    protected function computeProgressBonus(Visit $visit): float
    {
        $bonus = 0;

        // Stance progression
        if ($visit->stance_before && $visit->stance_after) {
            $stanceOrder = ['resistant' => 0, 'neutral' => 1, 'supportive' => 2];
            $before = $stanceOrder[$visit->stance_before] ?? 0;
            $after = $stanceOrder[$visit->stance_after] ?? 0;

            if ($before === 0 && $after === 1) {
                $bonus += 0.10; // Resistant → Neutral
            } elseif ($before === 1 && $after === 2) {
                $bonus += 0.15; // Neutral → Supportive
            } elseif ($before === 0 && $after === 2) {
                $bonus += 0.25; // Resistant → Supportive (big jump)
            }
        }

        // Booked concrete next step
        if ($visit->nextSteps()->exists()) {
            $bonus += 0.10;
        }

        // Closed a loop from a previous visit (check if any prior next_step was completed recently)
        $closedLoopCount = $visit->doctorProfile
            ?->visits()
            ->where('visits.id', '<', $visit->id)
            ->whereHas('nextSteps', function ($q) use ($visit) {
                $q->where('is_completed', true)
                    ->where('completed_at', '>=', $visit->visit_date->subDays(14));
            })
            ->count() ?? 0;

        if ($closedLoopCount > 0) {
            $bonus += 0.10;
        }

        return $bonus;
    }

    /**
     * Difficulty multiplier: C 0.9, B 1.0, A 1.15
     */
    protected function computeDifficultyMultiplier(Visit $visit): float
    {
        $difficulty = $visit->access_difficulty
            ?? $visit->doctorProfile?->access_difficulty
            ?? 'B';

        return DoctorProfile::difficultyMultiplierFor($difficulty);
    }

    /**
     * Time factor based on visit time goal assessment:
     *   'met'       → 1.0   (met the time goal)
     *   'on_progress' → 1.41 (making progress toward time goal)
     *   'exceeded'  → 2.0   (exceeded time expectations)
     *
     * Falls back to 1.0 if no time goal status is set.
     * Legacy: if only minutes are provided (no time_goal_status), use 1.0.
     */
    protected function computeTimeFactor(?int $minutes, ?string $timeGoalStatus = null): float
    {
        if ($timeGoalStatus) {
            return match ($timeGoalStatus) {
                'met'         => 1.0,
                'on_progress' => 1.41,
                'exceeded'    => 2.0,
                default       => 1.0,
            };
        }

        // Legacy fallback: no time goal status → neutral factor
        return 1.0;
    }

    /**
     * Confidence adjustment: always returns 1.0 (confidence is now x1 for everything).
     */
    protected function computeConfidenceAdjustment(?int $confidence): float
    {
        // Confidence is now always x1
        return 1.0;
    }

    /**
     * Cross-functional support bonus: +1.0 when the doctor needs cross-functional support.
     * Rewards reps for handling complex multi-department coordination.
     */
    protected function computeCrossFunctionalBonus(Visit $visit): float
    {
        $doctor = $visit->doctorProfile;

        if ($doctor && $doctor->needs_cross_functional_support) {
            return 1.0;
        }

        return 0;
    }

    // -----------------------------------------------------------
    // Aggregations
    // -----------------------------------------------------------

    /**
     * Doctor efficiency: recency-weighted average of last N visits.
     */
    public function doctorEfficiency(int $doctorProfileId, int $lastN = 10): float
    {
        $visits = Visit::forDoctor($doctorProfileId)
            ->whereNotNull('efficiency_score')
            ->orderByDesc('visit_date')
            ->limit($lastN)
            ->get();

        if ($visits->isEmpty()) {
            return 0;
        }

        // Recency weighting: most recent gets weight N, oldest gets 1
        $totalWeight = 0;
        $totalScore = 0;
        $count = $visits->count();

        foreach ($visits->values() as $i => $visit) {
            $weight = $count - $i; // e.g. 10, 9, 8…
            $totalWeight += $weight;
            $totalScore += $visit->efficiency_score * $weight;
        }

        return $totalWeight > 0 ? round($totalScore / $totalWeight, 3) : 0;
    }

    /**
     * Rep efficiency: weighted by doctor tier/priority.
     */
    public function repEfficiency(int $repId, int $days = 30): float
    {
        $visits = Visit::forRep($repId)
            ->with('doctorProfile')
            ->whereNotNull('efficiency_score')
            ->recent($days)
            ->get();

        if ($visits->isEmpty()) {
            return 0;
        }

        $tierWeights = ['A' => 1.5, 'B' => 1.0, 'C' => 0.7];
        $totalWeight = 0;
        $totalScore = 0;

        foreach ($visits as $visit) {
            $segment = $visit->doctorProfile?->segment ?? 'B';
            $weight = $tierWeights[$segment] ?? 1.0;
            $totalWeight += $weight;
            $totalScore += $visit->efficiency_score * $weight;
        }

        return $totalWeight > 0 ? round($totalScore / $totalWeight, 3) : 0;
    }

    /**
     * Territory efficiency: roll-up of all reps.
     */
    public function territoryEfficiency(array $repIds, int $days = 30): float
    {
        if (empty($repIds)) {
            return 0;
        }

        $totalScore = 0;
        $count = 0;

        foreach ($repIds as $repId) {
            $score = $this->repEfficiency($repId, $days);
            if ($score > 0) {
                $totalScore += $score;
                $count++;
            }
        }

        return $count > 0 ? round($totalScore / $count, 3) : 0;
    }
}
