<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user.
     * Returns Inertia page for normal visits, JSON for fetch/XHR.
     */
    public function index(Request $request): JsonResponse|\Inertia\Response
    {
        $notifications = Notification::forUser($request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn (Notification $n) => [
                'id' => $n->id,
                'type' => $n->type,
                'title' => $n->title,
                'body' => $n->body,
                'data' => $n->data,
                'icon' => $n->icon,
                'priority' => $n->priority,
                'read' => $n->isRead(),
                'created_at' => $n->created_at->diffForHumans(),
                'created_at_raw' => $n->created_at->toISOString(),
            ]);

        $unreadCount = Notification::forUser($request->user()->id)->unread()->count();

        // If the request wants JSON (fetch / polling), return JSON
        if ($request->wantsJson()) {
            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        }

        // Otherwise render the Inertia page
        return Inertia::render('dashboard/notifications/page', [
            'initialNotifications' => $notifications,
            'initialUnreadCount' => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        Notification::forUser($request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);
        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Create a notification (for admin/system use).
     */
    public static function notify(
        int $userId,
        string $type,
        string $title,
        string $body,
        ?array $data = null,
        ?string $icon = null,
        string $priority = 'normal'
    ): Notification {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'icon' => $icon,
            'priority' => $priority,
        ]);
    }

    /**
     * Send a notification to multiple users (admin).
     */
    public function sendBulk(Request $request): JsonResponse
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'type' => 'string|in:system,admin_message,ai_insight',
            'priority' => 'string|in:low,normal,high,urgent',
        ]);

        $count = 0;
        foreach ($request->user_ids as $userId) {
            self::notify(
                $userId,
                $request->get('type', 'admin_message'),
                $request->title,
                $request->body,
                ['sent_by' => $request->user()->id],
                'message-circle',
                $request->get('priority', 'normal')
            );
            $count++;
        }

        return response()->json(['success' => true, 'sent' => $count]);
    }
}
