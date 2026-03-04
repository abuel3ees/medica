<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\DoctorProfile;
use App\Models\FeatureFlag;
use App\Models\Medication;
use App\Models\Notification;
use App\Models\User;
use App\Models\Visit;
use App\Models\Objective;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Admin dashboard overview.
     */
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_reps' => User::where('role', 'rep')->count(),
            'total_managers' => User::where('role', 'manager')->count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_visits' => Visit::count(),
            'total_doctors' => DoctorProfile::count(),
            'total_objectives' => Objective::count(),
            'total_medications' => Medication::count(),
            'total_notifications' => Notification::count(),
            'unread_notifications' => Notification::whereNull('read_at')->count(),
            'visits_today' => Visit::whereDate('created_at', today())->count(),
            'visits_this_week' => Visit::where('created_at', '>=', now()->startOfWeek())->count(),
            'visits_this_month' => Visit::where('created_at', '>=', now()->startOfMonth())->count(),
            'avg_efficiency' => round(Visit::avg('efficiency_score') ?? 0, 1),
        ];

        // Database info
        $dbStats = [
            'size' => $this->getDatabaseSize(),
            'tables' => $this->getTableStats(),
        ];

        $featureFlags = FeatureFlag::all();

        $recentActivity = ActivityLog::with('user')
            ->orderByDesc('created_at')
            ->limit(30)
            ->get()
            ->map(fn ($log) => [
                'id' => $log->id,
                'user' => $log->user ? $log->user->name : 'System',
                'action' => $log->action,
                'subject' => $log->subject_type ? class_basename($log->subject_type) . ' #' . $log->subject_id : null,
                'properties' => $log->properties,
                'ip' => $log->ip_address,
                'time' => $log->created_at->diffForHumans(),
            ]);

        $users = User::orderBy('name')
            ->get()
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'created_at' => $u->created_at->format('M d, Y'),
                'visits_count' => $u->isRep() ? $u->visits()->count() : null,
                'onboarding_completed' => $u->onboarding_completed,
            ]);

        return Inertia::render('dashboard/admin/page', [
            'stats' => $stats,
            'dbStats' => $dbStats,
            'featureFlags' => $featureFlags,
            'recentActivity' => $recentActivity,
            'users' => $users,
        ]);
    }

    /**
     * Toggle a feature flag.
     */
    public function toggleFeatureFlag(Request $request, FeatureFlag $featureFlag): JsonResponse
    {
        $featureFlag->update(['enabled' => !$featureFlag->enabled]);

        ActivityLog::log('feature_flag_toggled', $featureFlag, [
            'key' => $featureFlag->key,
            'enabled' => $featureFlag->enabled,
        ]);

        // Notify all admins about flag change
        $admins = User::role('admin')->where('id', '!=', $request->user()->id)->get();
        foreach ($admins as $admin) {
            NotificationController::notify(
                $admin->id,
                'feature_flag_toggled',
                'Feature Flag Changed',
                "Feature \"{$featureFlag->key}\" was " . ($featureFlag->enabled ? 'enabled' : 'disabled') . " by {$request->user()->name}.",
                ['key' => $featureFlag->key, 'enabled' => $featureFlag->enabled],
                'toggle-right',
                'low'
            );
        }

        return response()->json([
            'success' => true,
            'enabled' => $featureFlag->enabled,
        ]);
    }

    /**
     * Create a new user (manager adds reps/managers).
     */
    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['rep', 'manager', 'admin'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'email_verified_at' => now(),
        ]);

        // Assign Spatie role
        $user->assignRole($validated['role']);

        // If rep, create doctor profile placeholder
        if ($validated['role'] === 'rep') {
            // Create a notification for the new rep
            NotificationController::notify(
                $user->id,
                'system',
                'Welcome to Medica!',
                'Your account has been created. Start by logging your first doctor visit.',
                ['action' => '/dashboard/visits/create'],
                'sparkles',
                'high'
            );
        }

        ActivityLog::log('user_created', $user, [
            'role' => $validated['role'],
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at->format('M d, Y'),
            ],
        ]);
    }

    /**
     * Update a user's role.
     */
    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => ['sometimes', Rule::in(['rep', 'manager', 'admin'])],
            'password' => 'sometimes|string|min:8',
        ]);

        $oldRole = $user->role;

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        // Sync Spatie role if role changed
        if (isset($validated['role']) && $validated['role'] !== $oldRole) {
            $user->syncRoles([$validated['role']]);

            NotificationController::notify(
                $user->id,
                'role_changed',
                'Role Updated',
                "Your role has been changed from {$oldRole} to {$validated['role']} by an administrator.",
                ['old_role' => $oldRole, 'new_role' => $validated['role']],
                'shield',
                'high'
            );
        }

        ActivityLog::log('user_updated', $user, [
            'changes' => array_keys($validated),
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a user.
     */
    public function destroyUser(Request $request, User $user): JsonResponse
    {
        abort_if($user->id === $request->user()->id, 403, 'Cannot delete yourself');

        $deletedName = $user->name;
        $deletedEmail = $user->email;

        ActivityLog::log('user_deleted', $user, [
            'deleted_user' => $user->email,
        ]);

        $user->delete();

        // Notify all admins about the deletion
        $admins = User::role('admin')->where('id', '!=', $request->user()->id)->get();
        foreach ($admins as $admin) {
            NotificationController::notify(
                $admin->id,
                'user_deleted',
                'User Account Deleted',
                "{$deletedName} ({$deletedEmail}) was removed by {$request->user()->name}.",
                ['deleted_name' => $deletedName, 'deleted_email' => $deletedEmail],
                'user-minus',
                'normal'
            );
        }

        return response()->json(['success' => true]);
    }

    /**
     * Send notification from admin panel.
     */
    public function sendNotification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'priority' => 'string|in:low,normal,high,urgent',
        ]);

        $count = 0;
        foreach ($validated['user_ids'] as $userId) {
            NotificationController::notify(
                $userId,
                'admin_message',
                $validated['title'],
                $validated['body'],
                ['sent_by' => $request->user()->id, 'sent_by_name' => $request->user()->name],
                'megaphone',
                $validated['priority'] ?? 'normal'
            );
            $count++;
        }

        ActivityLog::log('notification_sent', null, [
            'recipients' => $count,
            'title' => $validated['title'],
        ]);

        return response()->json(['success' => true, 'sent' => $count]);
    }

    /**
     * Reset onboarding / dispatch tutorial for specified users.
     */
    public function resetOnboarding(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $count = User::whereIn('id', $validated['user_ids'])
            ->update([
                'onboarding_completed' => false,
                'onboarding_progress' => null,
            ]);

        // Notify affected users
        foreach ($validated['user_ids'] as $userId) {
            NotificationController::notify(
                $userId,
                'onboarding_reset',
                'Tutorial Reset',
                'Your onboarding tutorial has been reset. You\'ll see it again on your next login.',
                [],
                'refresh-cw',
                'normal'
            );
        }

        ActivityLog::log('onboarding_reset', null, [
            'user_ids' => $validated['user_ids'],
            'count' => $count,
            'reset_by' => $request->user()->id,
        ]);

        return response()->json(['success' => true, 'reset' => $count]);
    }

    // ─── Helpers ───────────────────────────────────────────

    private function getDatabaseSize(): string
    {
        $path = database_path('database.sqlite');
        if (file_exists($path)) {
            $bytes = filesize($path);
            if ($bytes >= 1048576) {
                return round($bytes / 1048576, 2) . ' MB';
            }
            return round($bytes / 1024, 2) . ' KB';
        }
        return 'N/A';
    }

    private function getTableStats(): array
    {
        $tables = [
            'users', 'visits', 'doctor_profiles', 'objectives',
            'visit_objectives', 'next_steps', 'objection_tags',
            'notifications', 'feature_flags', 'medications',
            'activity_logs', 'sessions', 'cache',
        ];

        $stats = [];
        foreach ($tables as $table) {
            try {
                $count = DB::table($table)->count();
                $stats[] = ['name' => $table, 'rows' => $count];
            } catch (\Exception $e) {
                $stats[] = ['name' => $table, 'rows' => 0];
            }
        }

        return $stats;
    }
}
