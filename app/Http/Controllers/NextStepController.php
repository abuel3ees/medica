<?php

namespace App\Http\Controllers;

use App\Models\NextStep;
use Illuminate\Http\RedirectResponse;

class NextStepController extends Controller
{
    /**
     * Mark a next step as completed.
     */
    public function complete(NextStep $nextStep): RedirectResponse
    {
        $nextStep->markComplete();

        return back()->with('success', 'Follow-up marked as completed.');
    }
}
