<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ─── Permissions ────────────────────────────────────────
        // Visit permissions
        Permission::create(['name' => 'view visits']);
        Permission::create(['name' => 'create visits']);
        Permission::create(['name' => 'edit visits']);
        Permission::create(['name' => 'delete visits']);
        Permission::create(['name' => 'view all visits']);     // managers see all reps' visits

        // Doctor permissions
        Permission::create(['name' => 'view doctors']);
        Permission::create(['name' => 'create doctors']);
        Permission::create(['name' => 'edit doctors']);
        Permission::create(['name' => 'delete doctors']);

        // Objective permissions
        Permission::create(['name' => 'view objectives']);
        Permission::create(['name' => 'manage objectives']);   // create/edit/delete

        // Medication permissions
        Permission::create(['name' => 'view medications']);
        Permission::create(['name' => 'manage medications']); // create/edit/delete

        // AI Coach permissions
        Permission::create(['name' => 'use ai coach']);

        // Notification permissions
        Permission::create(['name' => 'view notifications']);
        Permission::create(['name' => 'send notifications']); // bulk send (admin)

        // Dashboard permissions
        Permission::create(['name' => 'view dashboard']);
        Permission::create(['name' => 'view team dashboard']); // manager-level team stats

        // Help / docs
        Permission::create(['name' => 'view help']);

        // Admin permissions
        Permission::create(['name' => 'access admin panel']);
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'manage feature flags']);
        Permission::create(['name' => 'view activity logs']);
        Permission::create(['name' => 'manage onboarding']);

        // ─── Roles ──────────────────────────────────────────────

        // Rep — field representative
        $rep = Role::create(['name' => 'rep']);
        $rep->givePermissionTo([
            'view visits',
            'create visits',
            'edit visits',
            'delete visits',
            'view doctors',
            'create doctors',
            'edit doctors',
            'view objectives',
            'view medications',
            'use ai coach',
            'view notifications',
            'view dashboard',
            'view help',
        ]);

        // Manager — team manager
        $manager = Role::create(['name' => 'manager']);
        $manager->givePermissionTo([
            'view visits',
            'create visits',
            'edit visits',
            'delete visits',
            'view all visits',
            'view doctors',
            'create doctors',
            'edit doctors',
            'delete doctors',
            'view objectives',
            'manage objectives',
            'view medications',
            'manage medications',
            'use ai coach',
            'view notifications',
            'send notifications',
            'view dashboard',
            'view team dashboard',
            'view help',
            'access admin panel',
            'manage users',
            'view activity logs',
            'manage onboarding',
        ]);

        // Admin — full access
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo(Permission::all());
    }
}
