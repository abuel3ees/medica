<?php

namespace App\Http\Controllers;

use App\Models\DoctorProfile;
use App\Models\NextStep;
use App\Models\QuarterlyLog;
use App\Models\User;
use App\Models\Visit;
use App\Services\EfficiencyScoreService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DoctorController extends Controller
{
    public function __construct(
        private readonly EfficiencyScoreService $efficiencyService,
    ) {}

    /**
     * List all doctors with search/filter.
     */
    public function index(Request $request): Response
    {
        $query = DoctorProfile::with('user:id,name')
            ->withCount('visits');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"))
                    ->orWhere('specialty', 'like', "%{$search}%")
                    ->orWhere('institution', 'like', "%{$search}%");
            });
        }

        if ($segment = $request->input('segment')) {
            $query->bySegment($segment);
        }

        $doctors = $query->orderBy('specialty')
            ->get()
            ->map(fn ($doc) => [
                'id' => $doc->id,
                'name' => $doc->display_name,
                'specialty' => $doc->specialty,
                'institution' => $doc->institution,
                'location' => $doc->location,
                'segment' => $doc->segment,
                'stance' => $doc->stance,
                'access_difficulty' => $doc->access_difficulty,
                'visits_count' => $doc->visits_count,
                'trend' => $this->getDoctorTrend($doc->id),
            ]);

        // Selected doctor detail
        $selectedDoctor = null;
        if ($docId = $request->input('doctor_id')) {
            $selectedDoctor = $this->getDoctorDetail((int) $docId);
        } elseif ($doctors->isNotEmpty()) {
            $selectedDoctor = $this->getDoctorDetail($doctors->first()['id']);
        }

        return Inertia::render('dashboard/doctors/page', [
            'doctors' => $doctors,
            'selectedDoctor' => $selectedDoctor,
        ]);
    }

    /**
     * Show create doctor form.
     */
    public function create(): Response
    {
        return Inertia::render('dashboard/doctors/create');
    }

    /**
     * Store a new doctor profile.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'specialty' => ['required', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'segment' => ['required', 'in:A,B,C'],
            'stance' => ['required', 'in:supportive,neutral,resistant'],
            'access_difficulty' => ['required', 'in:A,B,C'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'needs_cross_functional_support' => ['nullable', 'boolean'],
            'cross_functional_departments' => ['nullable', 'string', 'max:255'],
        ]);

        // Create a user for the doctor
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make('password'),
            'role' => 'doctor',
        ]);

        DoctorProfile::create([
            'user_id' => $user->id,
            'specialty' => $validated['specialty'],
            'institution' => $validated['institution'] ?? null,
            'location' => $validated['location'] ?? null,
            'segment' => $validated['segment'],
            'stance' => $validated['stance'],
            'access_difficulty' => $validated['access_difficulty'],
            'difficulty_multiplier' => DoctorProfile::difficultyMultiplierFor($validated['access_difficulty']),
            'license_number' => $validated['license_number'] ?? null,
            'years_of_experience' => $validated['years_of_experience'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'needs_cross_functional_support' => $validated['needs_cross_functional_support'] ?? false,
            'cross_functional_departments' => $validated['cross_functional_departments'] ?? null,
        ]);

        // Notify managers/admins about the new doctor
        $managers = User::permission('view all visits')->get();
        foreach ($managers as $manager) {
            NotificationController::notify(
                $manager->id,
                'doctor_created',
                'New Doctor Added',
                "Dr. {$validated['name']} ({$validated['specialty']}) has been added to the database by ".auth()->user()->name.'.',
                ['doctor_name' => $validated['name'], 'specialty' => $validated['specialty']],
                'user-plus',
                'normal'
            );
        }

        // Notify the creator
        NotificationController::notify(
            auth()->id(),
            'doctor_created',
            'Doctor Profile Created',
            "You successfully added Dr. {$validated['name']} to the system.",
            ['doctor_name' => $validated['name']],
            'check-circle',
            'low'
        );

        // Quarterly log
        QuarterlyLog::record('doctor_created', $user, "Dr. {$validated['name']}", 'high', [
            'specialty' => $validated['specialty'], 'segment' => $validated['segment'], 'created_by' => auth()->user()->name,
        ]);

        return redirect()->route('doctors.index')
            ->with('success', 'Doctor profile created successfully!');
    }

    /**
     * Get full doctor detail.
     */
    public function show(int $id): Response
    {
        $detail = $this->getDoctorDetail($id);

        return Inertia::render('dashboard/doctors/show', [
            'doctor' => $detail,
        ]);
    }

    /**
     * Show the edit form for a doctor.
     */
    public function edit(int $id): Response
    {
        $doctor = DoctorProfile::with('user:id,name,email')->findOrFail($id);

        return Inertia::render('dashboard/doctors/edit', [
            'doctor' => [
                'id' => $doctor->id,
                'name' => $doctor->user->name,
                'email' => $doctor->user->email,
                'specialty' => $doctor->specialty,
                'institution' => $doctor->institution,
                'location' => $doctor->location,
                'segment' => $doctor->segment,
                'stance' => $doctor->stance,
                'access_difficulty' => $doctor->access_difficulty,
                'license_number' => $doctor->license_number,
                'years_of_experience' => $doctor->years_of_experience,
                'bio' => $doctor->bio,
                'needs_cross_functional_support' => $doctor->needs_cross_functional_support,
                'cross_functional_departments' => $doctor->cross_functional_departments,
            ],
        ]);
    }

    /**
     * Update doctor profile.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $doctor = DoctorProfile::with('user')->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$doctor->user_id],
            'specialty' => ['required', 'string', 'max:255'],
            'institution' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'segment' => ['required', 'in:A,B,C'],
            'stance' => ['required', 'in:supportive,neutral,resistant'],
            'access_difficulty' => ['required', 'in:A,B,C'],
            'license_number' => ['nullable', 'string', 'max:100'],
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'needs_cross_functional_support' => ['nullable', 'boolean'],
            'cross_functional_departments' => ['nullable', 'string', 'max:255'],
        ]);

        $doctor->user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        $doctor->update([
            'specialty' => $validated['specialty'],
            'institution' => $validated['institution'] ?? null,
            'location' => $validated['location'] ?? null,
            'segment' => $validated['segment'],
            'stance' => $validated['stance'],
            'access_difficulty' => $validated['access_difficulty'],
            'difficulty_multiplier' => DoctorProfile::difficultyMultiplierFor($validated['access_difficulty']),
            'license_number' => $validated['license_number'] ?? null,
            'years_of_experience' => $validated['years_of_experience'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'needs_cross_functional_support' => $validated['needs_cross_functional_support'] ?? false,
            'cross_functional_departments' => $validated['cross_functional_departments'] ?? null,
        ]);

        NotificationController::notify(
            auth()->id(),
            'doctor_updated',
            'Doctor Profile Updated',
            "Dr. {$validated['name']}'s profile has been updated.",
            ['doctor_name' => $validated['name']],
            'edit',
            'low'
        );

        // Notify managers about the update
        $managers = User::permission('view all visits')->where('id', '!=', auth()->id())->get();
        foreach ($managers as $manager) {
            NotificationController::notify(
                $manager->id,
                'doctor_updated_team',
                'Doctor Profile Updated',
                auth()->user()->name." updated Dr. {$validated['name']}'s profile.",
                ['doctor_name' => $validated['name']],
                'edit',
                'low'
            );
        }

        // Quarterly log
        QuarterlyLog::record('doctor_updated', $doctor, "Dr. {$validated['name']}", 'normal', [
            'updated_by' => auth()->user()->name,
        ]);

        return redirect()->route('doctors.index')
            ->with('success', 'Doctor profile updated!');
    }

    /**
     * Delete a doctor profile.
     */
    public function destroy(int $id): RedirectResponse
    {
        $doctor = DoctorProfile::with('user:id,name')->findOrFail($id);
        $doctorName = $doctor->display_name;

        // Quarterly log (before delete)
        QuarterlyLog::record('doctor_deleted', $doctor, "Dr. {$doctorName}", 'critical', [
            'deleted_by' => auth()->user()->name,
        ]);

        $doctor->delete(); // soft delete

        NotificationController::notify(
            auth()->id(),
            'doctor_deleted',
            'Doctor Profile Deleted',
            "Dr. {$doctorName}'s profile has been removed.",
            ['doctor_name' => $doctorName],
            'trash',
            'low'
        );

        // Notify managers about the deletion
        $managers = User::permission('view all visits')->where('id', '!=', auth()->id())->get();
        foreach ($managers as $manager) {
            NotificationController::notify(
                $manager->id,
                'doctor_deleted_team',
                'Doctor Profile Deleted',
                auth()->user()->name." deleted Dr. {$doctorName}'s profile.",
                ['doctor_name' => $doctorName],
                'trash',
                'high'
            );
        }

        return redirect()->route('doctors.index')
            ->with('success', 'Doctor profile deleted.');
    }

    /**
     * Build doctor detail data.
     */
    private function getDoctorDetail(int $doctorProfileId): array
    {
        $doctor = DoctorProfile::with('user:id,name')->findOrFail($doctorProfileId);

        // Visit history
        $visits = Visit::forDoctor($doctorProfileId)
            ->with([
                'rep:id,name',
                'visitObjectives.objective:id,name',
                'nextSteps',
            ])
            ->orderByDesc('visit_date')
            ->limit(20)
            ->get();

        $visitHistory = $visits->map(fn ($visit) => [
            'id' => $visit->id,
            'date' => $visit->visit_date->format('M d, Y'),
            'rep' => $visit->rep?->name,
            'type' => $visit->visit_type,
            'objectives_summary' => $visit->visitObjectives
                ->map(fn ($vo) => $vo->objective?->name)
                ->filter()
                ->implode(', '),
            'score' => round((float) $visit->efficiency_score, 2),
            'time_spent' => $visit->time_spent_minutes ? $visit->time_spent_minutes.'m' : null,
        ]);

        // Trend data for chart (last 10 visits)
        $trendData = $visits->take(10)->reverse()->values()->map(fn ($v, $i) => [
            'label' => 'V'.($i + 1),
            'score' => round((float) $v->efficiency_score, 2),
        ]);

        // Open loops
        $openLoops = NextStep::whereHas('visit', fn ($q) => $q->where('doctor_profile_id', $doctorProfileId))
            ->open()
            ->with('visit:id,visit_date')
            ->orderByDesc('due_date')
            ->get()
            ->map(fn ($ns) => [
                'id' => $ns->id,
                'description' => $ns->description,
                'type' => $ns->type,
                'due_date' => $ns->due_date?->format('M d, Y'),
                'visit_date' => $ns->visit?->visit_date?->format('M d, Y'),
                'is_overdue' => $ns->due_date && $ns->due_date->isPast(),
            ]);

        // Efficiency metrics
        $avgEfficiency = $visits->avg('efficiency_score') ?? 0;

        return [
            'id' => $doctor->id,
            'name' => $doctor->display_name,
            'specialty' => $doctor->specialty,
            'institution' => $doctor->institution,
            'location' => $doctor->location,
            'segment' => $doctor->segment,
            'stance' => $doctor->stance,
            'access_difficulty' => $doctor->access_difficulty,
            'visits_count' => $visits->count(),
            'avg_score' => round($avgEfficiency, 2),
            'trend' => $this->getDoctorTrend($doctorProfileId),
            'visit_history' => $visitHistory,
            'trend_data' => $trendData,
            'open_loops' => $openLoops,
        ];
    }

    /**
     * Determine doctor trend.
     */
    private function getDoctorTrend(int $doctorProfileId): string
    {
        $scores = Visit::forDoctor($doctorProfileId)
            ->whereNotNull('efficiency_score')
            ->orderByDesc('visit_date')
            ->limit(6)
            ->pluck('efficiency_score');

        if ($scores->count() < 3) {
            return 'new';
        }

        $recent = $scores->take(3)->avg();
        $older = $scores->skip(3)->avg();

        if (! $older) {
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
