<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Track onboarding tutorial completion per user
        $table = Schema::table('users', function (Blueprint $table) {
            $table->boolean('onboarding_completed')->default(false)->after('role');
            $table->json('onboarding_progress')->nullable()->after('onboarding_completed');
        });

        // Activity log for the admin dashboard
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action'); // login, visit_created, doctor_added, score_calculated, etc.
            $table->string('subject_type')->nullable(); // App\Models\Visit, etc.
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('properties')->nullable(); // extra context
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['onboarding_completed', 'onboarding_progress']);
        });
        Schema::dropIfExists('activity_logs');
    }
};
