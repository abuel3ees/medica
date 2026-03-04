<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use App\Models\FeatureFlag;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $featureFlags = [];
        try {
            $featureFlags = FeatureFlag::pluck('enabled', 'key')->toArray();
        } catch (\Exception $e) {
            // Table may not exist yet during migrations
        }

        $unreadNotifications = 0;
        $userPermissions = [];
        $userRoles = [];
        if ($request->user()) {
            try {
                $unreadNotifications = Notification::forUser($request->user()->id)->unread()->count();
            } catch (\Exception $e) {
                // Table may not exist yet
            }

            try {
                $userPermissions = $request->user()->getAllPermissions()->pluck('name')->toArray();
                $userRoles = $request->user()->getRoleNames()->toArray();
            } catch (\Exception $e) {
                // Spatie tables may not exist yet
            }
        }

        $companyName = 'Medica';
        try {
            $companyName = AppSetting::companyName();
        } catch (\Exception $e) {
            // Table may not exist yet during migrations
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'companyName' => $companyName,
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'featureFlags' => $featureFlags,
            'unreadNotifications' => $unreadNotifications,
            'userPermissions' => $userPermissions,
            'userRoles' => $userRoles,
        ];
    }
}
