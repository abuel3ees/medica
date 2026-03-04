<?php

namespace App\Http\Controllers;

use App\Models\Objective;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ObjectiveController extends Controller
{
    /**
     * List all objectives.
     */
    public function index(): Response
    {
        $objectives = Objective::withCount('visitObjectives')
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get()
            ->map(fn ($obj) => [
                'id'         => $obj->id,
                'name'       => $obj->name,
                'category'   => $obj->category,
                'importance' => $obj->importance,
                'weight'     => (float) $obj->weight,
                'is_active'  => $obj->is_active,
                'usage_count' => $obj->visit_objectives_count,
            ]);

        return Inertia::render('dashboard/objectives/page', [
            'objectives' => $objectives,
        ]);
    }

    /**
     * Store a new objective.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255', 'unique:objectives,name'],
            'category'   => ['nullable', 'string', 'max:100'],
            'importance' => ['required', 'in:high,standard,low'],
            'weight'     => ['required', 'numeric', 'min:0.1', 'max:5.0'],
            'is_active'  => ['boolean'],
        ]);

        Objective::create($validated);

        return redirect()->route('objectives.index')
            ->with('success', 'Objective created!');
    }

    /**
     * Update an objective.
     */
    public function update(Request $request, Objective $objective): RedirectResponse
    {
        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255', 'unique:objectives,name,' . $objective->id],
            'category'   => ['nullable', 'string', 'max:100'],
            'importance' => ['required', 'in:high,standard,low'],
            'weight'     => ['required', 'numeric', 'min:0.1', 'max:5.0'],
            'is_active'  => ['boolean'],
        ]);

        $objective->update($validated);

        return redirect()->route('objectives.index')
            ->with('success', 'Objective updated!');
    }

    /**
     * Delete an objective.
     */
    public function destroy(Objective $objective): RedirectResponse
    {
        // If objective has been used, deactivate instead of deleting
        if ($objective->visitObjectives()->exists()) {
            $objective->update(['is_active' => false]);

            return redirect()->route('objectives.index')
                ->with('success', 'Objective deactivated (has linked visits).');
        }

        $objective->delete();

        return redirect()->route('objectives.index')
            ->with('success', 'Objective deleted.');
    }
}
