<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AiCoachController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\NextStepController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ObjectiveController;
use App\Http\Controllers\QuarterlyLogController;
use App\Http\Controllers\VisitController;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Models\FeatureFlag;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => false,
        'demoMode' => FeatureFlag::isEnabled('demo_mode'),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('permission:view dashboard')
        ->name('dashboard');

    // Visits (full CRUD)
    Route::middleware('permission:view visits')->group(function () {
        Route::get('visits', [VisitController::class, 'index'])->name('visits.index');
        Route::get('visits/create', [VisitController::class, 'create'])->middleware('permission:create visits')->name('visits.create');
        Route::post('visits', [VisitController::class, 'store'])->middleware('permission:create visits')->name('visits.store');
        Route::get('visits/{visit}/edit', [VisitController::class, 'edit'])->middleware('permission:edit visits')->name('visits.edit');
        Route::put('visits/{visit}', [VisitController::class, 'update'])->middleware('permission:edit visits')->name('visits.update');
        Route::delete('visits/{visit}', [VisitController::class, 'destroy'])->middleware('permission:delete visits')->name('visits.destroy');
    });

    // Doctors (full CRUD)
    Route::middleware('permission:view doctors')->group(function () {
        Route::get('doctors', [DoctorController::class, 'index'])->name('doctors.index');
        Route::get('doctors/create', [DoctorController::class, 'create'])->middleware('permission:create doctors')->name('doctors.create');
        Route::post('doctors', [DoctorController::class, 'store'])->middleware('permission:create doctors')->name('doctors.store');
        Route::get('doctors/{id}/edit', [DoctorController::class, 'edit'])->middleware('permission:edit doctors')->name('doctors.edit');
        Route::put('doctors/{id}', [DoctorController::class, 'update'])->middleware('permission:edit doctors')->name('doctors.update');
        Route::delete('doctors/{id}', [DoctorController::class, 'destroy'])->middleware('permission:delete doctors')->name('doctors.destroy');
        Route::get('doctors/{id}', [DoctorController::class, 'show'])->name('doctors.show');
    });

    // Objectives (full CRUD)
    Route::middleware('permission:view objectives')->group(function () {
        Route::get('objectives', [ObjectiveController::class, 'index'])->name('objectives.index');
        Route::post('objectives', [ObjectiveController::class, 'store'])->middleware('permission:manage objectives')->name('objectives.store');
        Route::put('objectives/{objective}', [ObjectiveController::class, 'update'])->middleware('permission:manage objectives')->name('objectives.update');
        Route::delete('objectives/{objective}', [ObjectiveController::class, 'destroy'])->middleware('permission:manage objectives')->name('objectives.destroy');
    });

    // Next steps (complete)
    Route::patch('next-steps/{nextStep}/complete', [NextStepController::class, 'complete'])->name('next-steps.complete');

    // AI Coach
    Route::middleware('permission:use ai coach')->group(function () {
        Route::get('ai-coach', [AiCoachController::class, 'index'])->name('ai-coach.index');
        Route::post('ai-coach/ask', [AiCoachController::class, 'ask'])->name('ai-coach.ask');
    });

    // Help & Documentation
    Route::get('help', [HelpController::class, 'index'])
        ->middleware('permission:view help')
        ->name('help.index');

    // Notifications
    Route::middleware('permission:view notifications')->group(function () {
        Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
        Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
        Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    });

    // Medications
    Route::middleware('permission:view medications')->group(function () {
        Route::get('medications', [MedicationController::class, 'index'])->name('medications.index');
        Route::post('medications', [MedicationController::class, 'store'])->middleware('permission:manage medications')->name('medications.store');
        Route::put('medications/{medication}', [MedicationController::class, 'update'])->middleware('permission:manage medications')->name('medications.update');
        Route::delete('medications/{medication}', [MedicationController::class, 'destroy'])->middleware('permission:manage medications')->name('medications.destroy');
    });

    // Quarterly Logs (manager review)
    Route::middleware('permission:view all visits')->group(function () {
        Route::get('quarterly-logs', [QuarterlyLogController::class, 'index'])->name('quarterly-logs.index');
        Route::patch('quarterly-logs/{quarterlyLog}/review', [QuarterlyLogController::class, 'review'])->name('quarterly-logs.review');
        Route::post('quarterly-logs/bulk-review', [QuarterlyLogController::class, 'bulkReview'])->name('quarterly-logs.bulkReview');
    });

    // Onboarding
    Route::post('onboarding/complete-step', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $progress = $user->onboarding_progress ?? [];
        $progress[$request->step] = true;
        $user->update(['onboarding_progress' => $progress]);

        $allSteps = ['welcome', 'dashboard', 'log_visit', 'doctors', 'visits', 'objectives', 'medications', 'ai_coach', 'help', 'notifications', 'command_palette', 'shortcuts', 'finish'];
        if (count(array_intersect_key(array_flip($allSteps), array_filter($progress))) === count($allSteps)) {
            $user->update(['onboarding_completed' => true]);
        }

        return response()->json(['success' => true, 'progress' => $progress]);
    })->name('onboarding.completeStep');

    Route::post('onboarding/skip', function (\Illuminate\Http\Request $request) {
        $request->user()->update(['onboarding_completed' => true]);

        return response()->json(['success' => true]);
    })->name('onboarding.skip');

    // ─── Admin / Dev Dashboard ────────────────────────────
    Route::middleware(EnsureUserIsAdmin::class)->prefix('admin')->group(function () {
        Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');
        Route::patch('feature-flags/{featureFlag}', [AdminController::class, 'toggleFeatureFlag'])
            ->middleware('permission:manage feature flags')
            ->name('admin.featureFlags.toggle');
        Route::post('users', [AdminController::class, 'storeUser'])
            ->middleware('permission:manage users')
            ->name('admin.users.store');
        Route::put('users/{user}', [AdminController::class, 'updateUser'])
            ->middleware('permission:manage users')
            ->name('admin.users.update');
        Route::delete('users/{user}', [AdminController::class, 'destroyUser'])
            ->middleware('permission:manage users')
            ->name('admin.users.destroy');
        Route::post('notifications/send', [AdminController::class, 'sendNotification'])
            ->middleware('permission:send notifications')
            ->name('admin.notifications.send');
        Route::post('onboarding/reset', [AdminController::class, 'resetOnboarding'])
            ->middleware('permission:manage onboarding')
            ->name('admin.onboarding.reset');
        Route::patch('company-name', [AdminController::class, 'updateCompanyName'])
            ->name('admin.companyName.update');
        Route::post('cache/clear', [AdminController::class, 'clearCache'])
            ->name('admin.cache.clear');
        Route::post('export', [AdminController::class, 'exportData'])
            ->name('admin.export');
        // Permission management
        Route::post('permissions', [AdminController::class, 'createPermission'])
            ->name('admin.permissions.create');
        Route::delete('permissions', [AdminController::class, 'deletePermission'])
            ->name('admin.permissions.delete');
        Route::patch('users/{user}/permissions', [AdminController::class, 'updateUserPermissions'])
            ->middleware('permission:manage users')
            ->name('admin.users.permissions');
    });
});

require __DIR__.'/settings.php';
