<?php

namespace App\Http\Controllers;

use App\Models\QuarterlyLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuarterlyLogController extends Controller
{
    /**
     * Show quarterly logs for manager review.
     */
    public function index(Request $request): Response
    {
        $quarter = $request->input('quarter', QuarterlyLog::currentQuarter());
        $priority = $request->input('priority');
        $reviewed = $request->input('reviewed'); // 'yes', 'no', or null for all

        $query = QuarterlyLog::with(['user:id,name,role', 'reviewer:id,name'])
            ->forQuarter($quarter)
            ->orderByDesc('created_at');

        if ($priority) {
            $query->byPriority($priority);
        }

        if ($reviewed === 'yes') {
            $query->where('reviewed', true);
        } elseif ($reviewed === 'no') {
            $query->unreviewed();
        }

        $logs = $query->paginate(50)->through(fn (QuarterlyLog $log) => [
            'id' => $log->id,
            'user' => $log->user?->name ?? 'System',
            'user_role' => $log->user?->role,
            'action' => $log->action,
            'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
            'subject_id' => $log->subject_id,
            'subject_name' => $log->subject_name,
            'priority' => $log->priority,
            'quarter' => $log->quarter,
            'details' => $log->details,
            'reviewed' => $log->reviewed,
            'reviewed_by' => $log->reviewer?->name,
            'reviewed_at' => $log->reviewed_at?->diffForHumans(),
            'review_notes' => $log->review_notes,
            'created_at' => $log->created_at->diffForHumans(),
            'created_at_raw' => $log->created_at->toISOString(),
        ]);

        // Summary stats
        $totalLogs = QuarterlyLog::forQuarter($quarter)->count();
        $unreviewedCount = QuarterlyLog::forQuarter($quarter)->unreviewed()->count();
        $criticalCount = QuarterlyLog::forQuarter($quarter)->byPriority('critical')->count();
        $highCount = QuarterlyLog::forQuarter($quarter)->byPriority('high')->count();

        // Available quarters
        $availableQuarters = QuarterlyLog::select('quarter')
            ->distinct()
            ->orderByDesc('quarter')
            ->pluck('quarter');

        if ($availableQuarters->isEmpty()) {
            $availableQuarters = collect([QuarterlyLog::currentQuarter()]);
        }

        return Inertia::render('dashboard/quarterly-logs/page', [
            'logs' => $logs,
            'currentQuarter' => $quarter,
            'availableQuarters' => $availableQuarters,
            'stats' => [
                'total' => $totalLogs,
                'unreviewed' => $unreviewedCount,
                'critical' => $criticalCount,
                'high' => $highCount,
            ],
            'filters' => [
                'priority' => $priority,
                'reviewed' => $reviewed,
            ],
        ]);
    }

    /**
     * Mark a log as reviewed.
     */
    public function review(Request $request, QuarterlyLog $quarterlyLog): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $quarterlyLog->markReviewed($request->input('notes'));

        return response()->json([
            'success' => true,
            'reviewed_by' => $request->user()->name,
            'reviewed_at' => $quarterlyLog->fresh()->reviewed_at->diffForHumans(),
        ]);
    }

    /**
     * Mark multiple logs as reviewed.
     */
    public function bulkReview(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:quarterly_logs,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        $count = QuarterlyLog::whereIn('id', $request->ids)
            ->update([
                'reviewed' => true,
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'review_notes' => $request->input('notes'),
            ]);

        return response()->json(['success' => true, 'reviewed' => $count]);
    }
}
