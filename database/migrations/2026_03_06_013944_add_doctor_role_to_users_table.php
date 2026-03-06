<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Widen the role enum to include 'doctor'.
     *
     * SQLite does not support ALTER COLUMN, so we drop & re-add.
     */
    public function up(): void
    {
        // Save existing role values
        $users = DB::table('users')->select('id', 'role')->get();

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['rep', 'manager', 'admin', 'doctor'])->default('rep')->after('is_active');
        });

        // Restore saved roles
        foreach ($users as $user) {
            DB::table('users')->where('id', $user->id)->update(['role' => $user->role]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $users = DB::table('users')->select('id', 'role')->get();

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['rep', 'manager', 'admin'])->default('rep')->after('is_active');
        });

        // Restore – doctors fall back to 'rep'
        foreach ($users as $user) {
            $role = $user->role === 'doctor' ? 'rep' : $user->role;
            DB::table('users')->where('id', $user->id)->update(['role' => $role]);
        }
    }
};
