<?php

namespace App\Http\Controllers;

use App\Models\DoctorProfile;
use App\Models\NextStep;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitObjective;
use App\Services\EfficiencyScoreService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly EfficiencyScoreService $efficiencyService,
    ) {}

    /**
     * Main manager dashboard.
     */
    public function index(Request $request): Response
    {
        $days = (int) $request->input('days', 30);
        $user = $request->user();
        $isManager = $user->hasPermissionTo('view team dashboard');

        return Inertia::render('dashboard/dashboard', [
            'stats'                => $this->getStats($days, $user, $isManager),
            'repScores'            => $isManager ? $this->getRepScores($days) : [],
            'recentVisits'         => $this->getRecentVisits(8, $user, $isManager),
            'efficiencyTrend'      => $this->getEfficiencyTrend($user, $isManager),
            'visitTrend'           => $this->getVisitTrend($user, $isManager),
            'heatmapData'          => $this->getHeatmapData($user, $isManager),
            'topDoctors'           => $this->getTopDoctors(5, $user, $isManager),
            'coachingInsights'     => $this->getCoachingInsights($days, $user, $isManager),
            'outcomeDistribution'  => $this->getOutcomeDistribution($days, $user, $isManager),
            'dailyVisits'          => $this->getDailyVisits($user, $isManager),
            'goalProgress'         => $this->getGoalProgress($days, $user, $isManager),
        ]);
    }

    /**
     * Summary stats.
     */
    private function getStats(int $days, $user, bool $isManager): array
    {
        $currentQuery = Visit::recent($days);
        $prevQuery = Visit::where('visit_date', '>=', now()->subDays($days * 2))
            ->where('visit_date', '<', now()->subDays($days));

        if (!$isManager) {
            $currentQuery->where('rep_id', $user->id);
            $prevQuery->where('rep_id', $user->id);
        }

        $currentVisits = $currentQuery->count();
        $previousVisits = (clone $prevQuery)->count();

        $visitChange = $previousVisits > 0
            ? round((($currentVisits - $previousVisits) / $previousVisits) * 100, 1)
            : 0;

        $avgEfficiency = Visit::recent($days)
            ->when(!$isManager, fn ($q) => $q->where('rep_id', $user->id))
            ->whereNotNull('efficiency_score')
            ->avg('efficiency_score') ?? 0;

        $prevAvgEfficiency = Visit::where('visit_date', '>=', now()->subDays($days * 2))
            ->where('visit_date', '<', now()->subDays($days))
            ->when(!$isManager, fn ($q) => $q->where('rep_id', $user->id))
            ->whereNotNull('efficiency_score')
            ->avg('efficiency_score') ?? 0;

        $efficiencyChange = $prevAvgEfficiency > 0
            ? round(($avgEfficiency - $prevAvgEfficiency), 1)
            : 0;

        $avgTime = Visit::recent($days)
            ->when(!$isManager, fn ($q) => $q->where('rep_id', $user->id))
            ->whereNotNull('time_spent_minutes')
            ->avg('time_spent_minutes') ?? 0;

        if ($isManager) {
            $activeReps = Visit::recent($days)->distinct('rep_id')->count('rep_id');
            return [
                ['label' => 'Total Visits', 'value' => number_format($currentVisits), 'change' => ($visitChange >= 0 ? '+' : '') . $visitChange . '%', 'up' => $visitChange >= 0],
                ['label' => 'Active Reps', 'value' => (string) $activeReps, 'change' => '+' . $activeReps, 'up' => true],
                ['label' => 'Avg Efficiency', 'value' => number_format($avgEfficiency * 100, 1), 'change' => ($efficiencyChange >= 0 ? '+' : '') . number_format($efficiencyChange * 100, 1), 'up' => $efficiencyChange >= 0],
                ['label' => 'Avg Visit Time', 'value' => round($avgTime) . 'm', 'change' => '-' . round($avgTime) . 'm', 'up' => true],
            ];
        }

        return [
            ['label' => 'My Visits', 'value' => number_format($currentVisits), 'change' => ($visitChange >= 0 ? '+' : '') . $visitChange . '%', 'up' => $visitChange >= 0],
            ['label' => 'My Efficiency', 'value' => number_format($avgEfficiency * 100, 1), 'change' => ($efficiencyChange >= 0 ? '+' : '') . number_format($efficiencyChange * 100, 1), 'up' => $efficiencyChange >= 0],
            ['label' => 'Avg Visit Time', 'value' => round($avgTime) . 'm', 'change' => '-' . round($avgTime) . 'm', 'up' => true],
            ['label' => 'Doctors Seen', 'value' => (string) Visit::recent($days)->where('rep_id', $user->id)->distinct('doctor_profile_id')->count('doctor_profile_id'), 'change' => '+0', 'up' => true],
        ];
    }

    /**
     * Rep leaderboard.
     */
    private function getRepScores(int $days): array
    {
        $reps = User::where('role', 'rep')
            ->withCount(['visits as recent_visits' => fn ($q) => $q->recent($days)])
            ->get();

        return $reps->map(function ($rep) use ($days) {
            $score = $this->efficiencyService->repEfficiency($rep->id, $days);

            // Previous period score for trend
            $prevVisits = Visit::forRep($rep->id)
                ->where('visit_date', '>=', now()->subDays($days * 2))
                ->where('visit_date', '<', now()->subDays($days))
                ->whereNotNull('efficiency_score')
                ->avg('efficiency_score') ?? 0;

            $change = $prevVisits > 0
                ? round(($score - $prevVisits) * 100, 1)
                : 0;

            return [
                'name'      => $rep->name,
                'score'     => round($score * 100, 1),
                'visits'    => $rep->recent_visits,
                'change'    => $change,
                'trend'     => $change > 0.5 ? 'up' : ($change < -0.5 ? 'down' : 'flat'),
            ];
        })
            ->sortByDesc('score')
            ->values()
            ->toArray();
    }

    /**
     * Recent visits feed.
     */
    private function getRecentVisits(int $limit = 8, $user = null, bool $isManager = true): array
    {
        return Visit::with([
            'rep:id,name',
            'doctorProfile.user:id,name',
            'visitObjectives',
        ])
            ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(fn ($visit) => [
                'doctor'    => $visit->doctorProfile?->display_name,
                'specialty' => $visit->doctorProfile?->specialty,
                'rep'       => $visit->rep?->name,
                'outcome'   => $this->overallOutcome($visit),
                'time'      => $visit->created_at->diffForHumans(),
                'score'     => $visit->efficiency_score,
            ])
            ->toArray();
    }

    /**
     * Monthly efficiency trend (last 6 months).
     */
    private function getEfficiencyTrend($user = null, bool $isManager = true): array
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            $avgScore = Visit::whereBetween('visit_date', [$monthStart, $monthEnd])
                ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
                ->whereNotNull('efficiency_score')
                ->avg('efficiency_score') ?? 0;

            // Top performer
            $topScore = Visit::whereBetween('visit_date', [$monthStart, $monthEnd])
                ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
                ->whereNotNull('efficiency_score')
                ->max('efficiency_score') ?? 0;

            $months->push([
                'month' => $date->format('M'),
                'avg'   => round($avgScore * 100, 1),
                'top'   => round($topScore * 100, 1),
            ]);
        }

        return $months->toArray();
    }

    /**
     * Monthly visit counts (last 6 months).
     */
    private function getVisitTrend($user = null, bool $isManager = true): array
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthStart = $date->copy()->startOfMonth();
            $monthEnd = $date->copy()->endOfMonth();

            $totalVisits = Visit::whereBetween('visit_date', [$monthStart, $monthEnd])
                ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
                ->count();

            $positiveOutcomes = Visit::whereBetween('visit_date', [$monthStart, $monthEnd])
                ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
                ->whereHas('visitObjectives', fn ($q) => $q->where('outcome', 'met'))
                ->count();

            $months->push([
                'month'    => $date->format('M'),
                'visits'   => $totalVisits,
                'outcomes' => $positiveOutcomes,
            ]);
        }

        return $months->toArray();
    }

    /**
     * Heatmap: visits by day-of-week and time block.
     */
    private function getHeatmapData($user = null, bool $isManager = true): array
    {
        // Group visits by day of week - we don't track time of day, so use visit counts per weekday
        $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $data = [];

        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            // SQLite: strftime('%w') returns 0=Sunday, 1=Monday, ..., 6=Saturday
            $dowExpr = "strftime('%w', visit_date)";
        } else {
            // MySQL: DAYOFWEEK() returns 1=Sunday, 2=Monday, ..., 7=Saturday
            // Subtract 1 to align with SQLite's 0-based numbering
            $dowExpr = "(DAYOFWEEK(visit_date) - 1)";
        }

        $visits = Visit::recent(90)
            ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
            ->select(DB::raw("{$dowExpr} as dow"), DB::raw('count(*) as cnt'))
            ->groupBy('dow')
            ->pluck('cnt', 'dow')
            ->toArray();

        $maxCount = max(array_values($visits) ?: [1]);

        foreach ($days as $idx => $day) {
            // dow: 0=Sunday, 1=Monday, ..., 6=Saturday (both drivers now aligned)
            $dow = ($idx + 1) % 7; // Mon=1, Tue=2, ..., Sun=0
            $count = $visits[$dow] ?? 0;
            // Normalize to 0-5 scale
            $data[] = [
                'day'   => $day,
                'count' => $count,
                'level' => $maxCount > 0 ? min(5, (int) round(($count / $maxCount) * 5)) : 0,
            ];
        }

        return $data;
    }

    /**
     * Top doctors by visit count.
     */
    private function getTopDoctors(int $limit = 5, $user = null, bool $isManager = true): array
    {
        return DoctorProfile::with('user:id,name')
            ->withCount(['visits' => function ($q) use ($user, $isManager) {
                $q->recent(90);
                if (!$isManager && $user) {
                    $q->where('rep_id', $user->id);
                }
            }])
            ->orderByDesc('visits_count')
            ->limit($limit)
            ->get()
            ->map(fn ($doc) => [
                'name'      => $doc->display_name,
                'specialty' => $doc->specialty,
                'visits'    => $doc->visits_count,
            ])
            ->toArray();
    }

    /**
     * Coaching insights (automated).
     */
    private function getCoachingInsights(int $days, $user = null, bool $isManager = true): array
    {
        $insights = [];

        // Check for high partials, low closures
        $totalObjectives = VisitObjective::whereHas('visit', function ($q) use ($days, $user, $isManager) {
            $q->recent($days);
            if (!$isManager && $user) {
                $q->where('rep_id', $user->id);
            }
        })->count();
        if ($totalObjectives > 0) {
            $partials = VisitObjective::where('outcome', 'partially_met')
                ->whereHas('visit', function ($q) use ($days, $user, $isManager) {
                    $q->recent($days);
                    if (!$isManager && $user) {
                        $q->where('rep_id', $user->id);
                    }
                })
                ->count();
            $mets = VisitObjective::where('outcome', 'met')
                ->whereHas('visit', function ($q) use ($days, $user, $isManager) {
                    $q->recent($days);
                    if (!$isManager && $user) {
                        $q->where('rep_id', $user->id);
                    }
                })
                ->count();

            $partialRate = $partials / $totalObjectives;
            $metRate = $mets / $totalObjectives;

            if ($partialRate > 0.35 && $metRate < 0.40) {
                $insights[] = [
                    'type'    => 'warning',
                    'title'   => 'High partials, low closures',
                    'message' => 'Partial outcomes are at ' . round($partialRate * 100) . '% while full met is only ' . round($metRate * 100) . '%. Focus on next-step discipline to close loops.',
                ];
            }
        }

        // Check if C-tier accounts dominate good scores
        $cTierScore = Visit::recent($days)
            ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
            ->where('access_difficulty', 'C')
            ->whereNotNull('efficiency_score')
            ->avg('efficiency_score') ?? 0;

        $aTierScore = Visit::recent($days)
            ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
            ->where('access_difficulty', 'A')
            ->whereNotNull('efficiency_score')
            ->avg('efficiency_score') ?? 0;

        if ($cTierScore > 0 && $aTierScore > 0 && $cTierScore > $aTierScore * 1.5) {
            $insights[] = [
                'type'    => 'info',
                'title'   => 'C-tier account dominance',
                'message' => 'Strong performance on C-tier accounts (' . round($cTierScore * 100, 1) . ') but A-tier accounts lag (' . round($aTierScore * 100, 1) . '). Build strategies for high-difficulty accounts.',
            ];
        }

        // Open loops reminder
        $openLoops = NextStep::open()->whereHas('visit', function ($q) use ($days, $user, $isManager) {
            $q->recent($days * 2);
            if (!$isManager && $user) {
                $q->where('rep_id', $user->id);
            }
        })->count();
        if ($openLoops > 5) {
            $overdueCount = NextStep::overdue()->count();
            $insights[] = [
                'type'    => 'action',
                'title'   => $openLoops . ' open follow-ups',
                'message' => $overdueCount . ' are overdue. Closing loops improves efficiency scores by up to +0.10 per visit.',
            ];
        }

        // Default insight if none
        if (empty($insights)) {
            $insights[] = [
                'type'    => 'success',
                'title'   => 'On track',
                'message' => 'No major issues detected. Keep up the good work and focus on maintaining consistency.',
            ];
        }

        return $insights;
    }

    /**
     * Outcome distribution for pie/donut chart.
     */
    private function getOutcomeDistribution(int $days, $user, bool $isManager): array
    {
        $visits = Visit::recent($days)
            ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
            ->with('visitObjectives')
            ->get();

        $positive = 0;
        $negative = 0;
        $neutral = 0;

        foreach ($visits as $visit) {
            $outcome = $this->overallOutcome($visit);
            if ($outcome === 'Positive') $positive++;
            elseif ($outcome === 'Negative') $negative++;
            else $neutral++;
        }

        return [
            ['name' => 'Positive', 'value' => $positive, 'color' => '#10b981'],
            ['name' => 'Neutral', 'value' => $neutral, 'color' => '#f59e0b'],
            ['name' => 'Negative', 'value' => $negative, 'color' => '#ef4444'],
        ];
    }

    /**
     * Daily visit counts for the last 14 days (bar chart).
     */
    private function getDailyVisits($user, bool $isManager): array
    {
        $data = [];

        for ($i = 13; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = Visit::whereDate('visit_date', $date->toDateString())
                ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
                ->count();

            $data[] = [
                'date'   => $date->format('M d'),
                'day'    => $date->format('D'),
                'visits' => $count,
            ];
        }

        return $data;
    }

    /**
     * Goal progress metrics (weekly targets).
     */
    private function getGoalProgress(int $days, $user, bool $isManager): array
    {
        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();

        $weeklyVisits = Visit::whereBetween('visit_date', [$weekStart, $weekEnd])
            ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
            ->count();

        $weeklyTarget = $isManager ? 50 : 15; // Target visits per week

        $avgScore = Visit::whereBetween('visit_date', [$weekStart, $weekEnd])
            ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
            ->whereNotNull('efficiency_score')
            ->avg('efficiency_score') ?? 0;

        $uniqueDoctors = Visit::whereBetween('visit_date', [$weekStart, $weekEnd])
            ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
            ->distinct('doctor_profile_id')
            ->count('doctor_profile_id');

        $doctorTarget = $isManager ? 20 : 8;

        $positiveOutcomes = Visit::whereBetween('visit_date', [$weekStart, $weekEnd])
            ->when(!$isManager && $user, fn ($q) => $q->where('rep_id', $user->id))
            ->whereHas('visitObjectives', fn ($q) => $q->where('outcome', 'met'))
            ->count();

        $positiveTarget = $isManager ? 30 : 10;

        return [
            'weeklyVisits'    => $weeklyVisits,
            'weeklyTarget'    => $weeklyTarget,
            'avgScore'        => round($avgScore * 100, 1),
            'uniqueDoctors'   => $uniqueDoctors,
            'doctorTarget'    => $doctorTarget,
            'positiveOutcomes' => $positiveOutcomes,
            'positiveTarget'  => $positiveTarget,
        ];
    }

    /**
     * Determine overall outcome for a visit.
     */
    private function overallOutcome(Visit $visit): string
    {
        $outcomes = $visit->visitObjectives->pluck('outcome');

        if ($outcomes->isEmpty()) {
            return 'Neutral';
        }

        $metCount = $outcomes->filter(fn ($o) => $o === 'met')->count();
        $notMetCount = $outcomes->filter(fn ($o) => $o === 'not_met')->count();

        if ($metCount > $notMetCount) {
            return 'Positive';
        }
        if ($notMetCount > $metCount) {
            return 'Negative';
        }

        return 'Neutral';
    }
}
