<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add time_goal_status to visits
        Schema::table('visits', function (Blueprint $table) {
            $table->string('time_goal_status')->nullable()->after('time_spent_minutes');
            // 'met', 'on_progress', 'exceeded'
        });

        // Add cross-functional support fields to doctor_profiles
        Schema::table('doctor_profiles', function (Blueprint $table) {
            $table->boolean('needs_cross_functional_support')->default(false)->after('bio');
            $table->string('cross_functional_departments')->nullable()->after('needs_cross_functional_support');
            // Comma-separated: 'marketing', 'medical', 'access'
        });
    }

    public function down(): void
    {
        Schema::table('visits', function (Blueprint $table) {
            $table->dropColumn('time_goal_status');
        });

        Schema::table('doctor_profiles', function (Blueprint $table) {
            $table->dropColumn(['needs_cross_functional_support', 'cross_functional_departments']);
        });
    }
};
