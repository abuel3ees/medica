<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVisitRequest;
use App\Models\DoctorProfile;
use App\Models\NextStep;
use App\Models\Objective;
use App\Models\ObjectionTag;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitObjective;
use App\Services\EfficiencyScoreService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitController extends Controller
{
    public function __construct(
        private readonly EfficiencyScoreService $efficiencyService,
    ) {}

    /**
     * Show the visit check-in form.
     */
    public function create(Request $request): Response
    {
        $doctors = DoctorProfile::with('user:id,name')
            ->orderBy('specialty')
            ->get()
            ->map(fn ($doc) => [
                'id'               => $doc->id,
                'name'             => $doc->display_name,
                'specialty'        => $doc->specialty,
                'institution'      => $doc->institution,
                'segment'          => $doc->segment,
                'stance'           => $doc->stance,
                'access_difficulty' => $doc->access_difficulty,
            ]);

        $objectives = Objective::active()->orderBy('name')->get([
            'id', 'name', 'category', 'importance', 'weight',
        ]);

        $objectionTags = ObjectionTag::orderBy('name')->get(['id', 'name']);

        // If a doctor is pre-selected, load their context
        $doctorContext = null;
        if ($request->has('doctor_id')) {
            $doctorContext = $this->buildDoctorContext((int) $request->doctor_id);
        }

        return Inertia::render('dashboard/visit/page', [
            'doctors'       => $doctors,
            'objectives'    => $objectives,
            'objectionTags' => $objectionTags,
            'doctorContext'  => $doctorContext,
        ]);
    }

    /**
     * Store a new visit.
     */
    public function store(StoreVisitRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // Create the visit
        $visit = Visit::create([
            'rep_id'              => auth()->id(),
            'doctor_profile_id'   => $validated['doctor_profile_id'],
            'visit_type'          => $validated['visit_type'],
            'visit_date'          => $validated['visit_date'],
            'notes'               => $validated['notes'] ?? null,
            'engagement_quality'  => $validated['engagement_quality'] ?? null,
            'access_difficulty'   => $validated['access_difficulty'] ?? null,
            'time_spent_minutes'  => $validated['time_spent_minutes'] ?? null,
            'confidence'          => $validated['confidence'] ?? null,
            'stance_before'       => $validated['stance_before'] ?? null,
            'stance_after'        => $validated['stance_after'] ?? null,
        ]);

        // Create visit objectives
        foreach ($validated['objectives'] as $obj) {
            VisitObjective::create([
                'visit_id'     => $visit->id,
                'objective_id' => $obj['objective_id'],
                'outcome'      => $obj['outcome'],
                'outcome_score' => VisitObjective::scoreForOutcome($obj['outcome']),
            ]);
        }

        // Sync objection tags
        if (! empty($validated['objection_tag_ids'])) {
            $visit->objectionTags()->sync($validated['objection_tag_ids']);
        }

        // Create next step
        if (! empty($validated['next_step'])) {
            NextStep::create([
                'visit_id'    => $visit->id,
                'description' => $validated['next_step']['description'],
                'type'        => $validated['next_step']['type'] ?? null,
                'due_date'    => $validated['next_step']['due_date'] ?? null,
            ]);
        }

        // Update doctor stance if changed
        if (! empty($validated['stance_after'])) {
            $visit->doctorProfile()->update([
                'stance' => $validated['stance_after'],
            ]);
        }

        // Calculate efficiency score
        $this->efficiencyService->calculateVisitScore($visit);

        // --- Notifications ---
        $doctor = DoctorProfile::with('user:id,name')->find($visit->doctor_profile_id);
        $doctorName = $doctor?->display_name ?? 'Unknown';
        $rep = auth()->user();
        $score = $visit->fresh()->efficiency_score;

        // Notify the rep
        NotificationController::notify(
            $rep->id,
            'visit_logged',
            'Visit Logged Successfully',
            "Your visit with Dr. {$doctorName} has been recorded. Efficiency score: " . round((float) $score, 2),
            ['visit_id' => $visit->id, 'score' => $score],
            'check-circle',
            'normal'
        );

        // Efficiency milestone notifications
        if ($score !== null && $score >= 0.85) {
            NotificationController::notify(
                $rep->id,
                'score_milestone',
                '🌟 Excellent Efficiency Score!',
                "You scored {$score} on your visit with Dr. {$doctorName} — outstanding work!",
                ['visit_id' => $visit->id, 'score' => $score],
                'trophy',
                'high'
            );
        }

        // Stance shift notification
        if (!empty($validated['stance_before']) && !empty($validated['stance_after']) && $validated['stance_before'] !== $validated['stance_after']) {
            $direction = $this->stanceDirection($validated['stance_before'], $validated['stance_after']);
            NotificationController::notify(
                $rep->id,
                'stance_shift',
                'Doctor Stance Changed',
                "Dr. {$doctorName} shifted from {$validated['stance_before']} → {$validated['stance_after']}. {$direction}",
                ['visit_id' => $visit->id, 'before' => $validated['stance_before'], 'after' => $validated['stance_after']],
                'arrow-right',
                $direction === 'Great progress!' ? 'high' : 'normal'
            );
        }

        // Notify managers about new visits
        $managers = User::permission('view all visits')->get();
        foreach ($managers as $manager) {
            NotificationController::notify(
                $manager->id,
                'visit_logged_team',
                'New Visit Logged',
                "{$rep->name} logged a visit with Dr. {$doctorName}. Score: " . round((float) $score, 2),
                ['visit_id' => $visit->id, 'rep_id' => $rep->id, 'rep_name' => $rep->name],
                'clipboard',
                'low'
            );
        }

        return redirect()->route('visits.create')
            ->with('success', 'Visit logged successfully! Efficiency score: ' . $visit->efficiency_score);
    }

    /**
     * Determine if a stance shift is positive or negative.
     */
    private function stanceDirection(string $before, string $after): string
    {
        $rank = ['resistant' => 0, 'neutral' => 1, 'supportive' => 2];
        $a = $rank[$before] ?? 0;
        $b = $rank[$after] ?? 0;

        return $b > $a ? 'Great progress!' : 'Worth investigating — what changed?';
    }

    /**
     * Show the edit form for a visit.
     */
    public function edit(Visit $visit): Response
    {
        // Only the rep who logged it (or a manager) can edit
        if (!auth()->user()->hasPermissionTo('view all visits') && $visit->rep_id !== auth()->id()) {
            abort(403);
        }

        $doctors = DoctorProfile::with('user:id,name')
            ->orderBy('specialty')
            ->get()
            ->map(fn ($doc) => [
                'id'               => $doc->id,
                'name'             => $doc->display_name,
                'specialty'        => $doc->specialty,
                'institution'      => $doc->institution,
                'segment'          => $doc->segment,
                'stance'           => $doc->stance,
                'access_difficulty' => $doc->access_difficulty,
            ]);

        $objectives = Objective::active()->orderBy('name')->get([
            'id', 'name', 'category', 'importance', 'weight',
        ]);

        $objectionTags = ObjectionTag::orderBy('name')->get(['id', 'name']);

        // Load existing visit data
        $visit->load(['visitObjectives.objective:id,name', 'objectionTags:id,name', 'nextSteps']);

        $visitData = [
            'id'                => $visit->id,
            'doctor_profile_id' => $visit->doctor_profile_id,
            'visit_type'        => $visit->visit_type,
            'visit_date'        => $visit->visit_date->format('Y-m-d'),
            'objectives'        => $visit->visitObjectives->map(fn ($vo) => [
                'objective_id' => $vo->objective_id,
                'outcome'      => $vo->outcome,
            ]),
            'engagement_quality' => $visit->engagement_quality,
            'access_difficulty'  => $visit->access_difficulty,
            'time_spent_minutes' => $visit->time_spent_minutes,
            'confidence'         => $visit->confidence,
            'stance_before'      => $visit->stance_before,
            'stance_after'       => $visit->stance_after,
            'notes'              => $visit->notes,
            'objection_tag_ids'  => $visit->objectionTags->pluck('id'),
            'next_step'          => $visit->nextSteps->first() ? [
                'description' => $visit->nextSteps->first()->description,
                'type'        => $visit->nextSteps->first()->type,
                'due_date'    => $visit->nextSteps->first()->due_date?->format('Y-m-d'),
            ] : null,
        ];

        $doctorContext = $this->buildDoctorContext($visit->doctor_profile_id);

        return Inertia::render('dashboard/visit/edit', [
            'visit'         => $visitData,
            'doctors'       => $doctors,
            'objectives'    => $objectives,
            'objectionTags' => $objectionTags,
            'doctorContext'  => $doctorContext,
        ]);
    }

    /**
     * Update a visit.
     */
    public function update(StoreVisitRequest $request, Visit $visit): RedirectResponse
    {
        if (auth()->user()->isRep() && $visit->rep_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validated();

        $visit->update([
            'doctor_profile_id'  => $validated['doctor_profile_id'],
            'visit_type'         => $validated['visit_type'],
            'visit_date'         => $validated['visit_date'],
            'notes'              => $validated['notes'] ?? null,
            'engagement_quality' => $validated['engagement_quality'] ?? null,
            'access_difficulty'  => $validated['access_difficulty'] ?? null,
            'time_spent_minutes' => $validated['time_spent_minutes'] ?? null,
            'confidence'         => $validated['confidence'] ?? null,
            'stance_before'      => $validated['stance_before'] ?? null,
            'stance_after'       => $validated['stance_after'] ?? null,
        ]);

        // Re-sync objectives
        $visit->visitObjectives()->delete();
        foreach ($validated['objectives'] as $obj) {
            VisitObjective::create([
                'visit_id'     => $visit->id,
                'objective_id' => $obj['objective_id'],
                'outcome'      => $obj['outcome'],
                'outcome_score' => VisitObjective::scoreForOutcome($obj['outcome']),
            ]);
        }

        // Re-sync objection tags
        $visit->objectionTags()->sync($validated['objection_tag_ids'] ?? []);

        // Re-sync next step
        $visit->nextSteps()->delete();
        if (! empty($validated['next_step'])) {
            NextStep::create([
                'visit_id'    => $visit->id,
                'description' => $validated['next_step']['description'],
                'type'        => $validated['next_step']['type'] ?? null,
                'due_date'    => $validated['next_step']['due_date'] ?? null,
            ]);
        }

        // Update doctor stance
        if (! empty($validated['stance_after'])) {
            $visit->doctorProfile()->update([
                'stance' => $validated['stance_after'],
            ]);
        }

        // Re-calculate efficiency score
        $this->efficiencyService->calculateVisitScore($visit);

        // Notify rep about the update
        $doctor = DoctorProfile::with('user:id,name')->find($visit->doctor_profile_id);
        $doctorName = $doctor?->display_name ?? 'Unknown';
        $score = $visit->fresh()->efficiency_score;

        NotificationController::notify(
            auth()->id(),
            'visit_updated',
            'Visit Updated',
            "Your visit with Dr. {$doctorName} has been updated. New score: " . round((float) $score, 2),
            ['visit_id' => $visit->id, 'score' => $score],
            'edit',
            'low'
        );

        return redirect()->route('visits.index')
            ->with('success', 'Visit updated successfully!');
    }

    /**
     * Delete a visit.
     */
    public function destroy(Visit $visit): RedirectResponse
    {
        if (auth()->user()->isRep() && $visit->rep_id !== auth()->id()) {
            abort(403);
        }

        $doctor = DoctorProfile::with('user:id,name')->find($visit->doctor_profile_id);
        $doctorName = $doctor?->display_name ?? 'Unknown';

        $visit->delete(); // soft delete

        NotificationController::notify(
            auth()->id(),
            'visit_deleted',
            'Visit Deleted',
            "Your visit with Dr. {$doctorName} has been removed.",
            [],
            'trash',
            'low'
        );

        return redirect()->route('visits.index')
            ->with('success', 'Visit deleted.');
    }

    /**
     * List visits for the current rep (or all if manager).
     */
    public function index(Request $request): Response
    {
        $query = Visit::with([
            'rep:id,name',
            'doctorProfile.user:id,name',
            'visitObjectives.objective:id,name,importance',
            'nextSteps',
            'objectionTags:id,name',
        ]);

        if (!auth()->user()->hasPermissionTo('view all visits')) {
            $query->forRep(auth()->id());
        }

        $visits = $query->orderByDesc('visit_date')
            ->paginate(20)
            ->through(fn ($visit) => [
                'id'                => $visit->id,
                'rep'               => $visit->rep?->name,
                'doctor'            => $visit->doctorProfile?->display_name,
                'specialty'         => $visit->doctorProfile?->specialty,
                'visit_type'        => $visit->visit_type,
                'visit_date'        => $visit->visit_date->format('M d, Y'),
                'objectives'        => $visit->visitObjectives->map(fn ($vo) => [
                    'name'    => $vo->objective?->name,
                    'outcome' => $vo->outcome,
                    'score'   => $vo->outcome_score,
                ]),
                'efficiency_score'  => $visit->efficiency_score,
                'engagement_quality' => $visit->engagement_quality,
                'time_spent'        => $visit->time_spent_minutes ? $visit->time_spent_minutes . 'm' : null,
                'next_steps'        => $visit->nextSteps->map(fn ($ns) => [
                    'description'  => $ns->description,
                    'due_date'     => $ns->due_date?->format('M d, Y'),
                    'is_completed' => $ns->is_completed,
                ]),
            ]);

        return Inertia::render('dashboard/visits/page', [
            'visits' => $visits,
        ]);
    }

    /**
     * Build context data for a selected doctor.
     */
    private function buildDoctorContext(int $doctorProfileId): array
    {
        $doctor = DoctorProfile::with('user:id,name')->findOrFail($doctorProfileId);
        $recentVisits = Visit::forDoctor($doctorProfileId)
            ->whereNotNull('efficiency_score')
            ->orderByDesc('visit_date')
            ->limit(10)
            ->get();

        $avgScore = $recentVisits->avg('efficiency_score') ?? 0;
        $lastVisit = $recentVisits->first();

        return [
            'difficulty'      => $doctor->access_difficulty,
            'stance'          => $doctor->stance,
            'segment'         => $doctor->segment,
            'last_visit'      => $lastVisit?->visit_date?->diffForHumans(),
            'visit_count'     => $recentVisits->count(),
            'avg_score'       => round($avgScore, 2),
            'trend'           => $this->determineTrend($recentVisits),
            'open_loops'      => $doctor->openLoops()->count(),
        ];
    }

    /**
     * Determine if outcomes are improving or declining.
     */
    private function determineTrend($visits): string
    {
        if ($visits->count() < 3) {
            return 'insufficient_data';
        }

        $recent = $visits->take(3)->avg('efficiency_score');
        $older = $visits->skip(3)->take(3)->avg('efficiency_score');

        if ($older == 0) {
            return 'new';
        }

        $change = (($recent - $older) / $older) * 100;

        if ($change > 5) {
            return 'improving';
        }
        if ($change < -5) {
            return 'declining';
        }

        return 'stable';
    }
}
