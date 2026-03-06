<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();

            // The rep who logged this visit
            $table->foreignId('rep_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // The doctor being visited
            $table->foreignId('doctor_profile_id')
                ->constrained('doctor_profiles')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Visit type
            $table->enum('visit_type', ['in_person', 'call', 'event', 'follow_up'])->default('in_person');

            // Date of visit
            $table->date('visit_date');

            // Notes
            $table->text('notes')->nullable();

            // Signals (optional quick toggles)
            $table->enum('engagement_quality', ['low', 'medium', 'high'])->nullable();
            $table->enum('access_difficulty', ['easy', 'moderate', 'hard'])->nullable();
            $table->unsignedSmallInteger('time_spent_minutes')->nullable(); // actual minutes

            // Confidence slider (0-100)
            $table->unsignedTinyInteger('confidence')->nullable();

            // Stance change tracking
            $table->enum('stance_before', ['supportive', 'neutral', 'resistant'])->nullable();
            $table->enum('stance_after', ['supportive', 'neutral', 'resistant'])->nullable();

            // Calculated scores (cached after compute)
            $table->decimal('efficiency_score', 6, 3)->nullable();
            $table->decimal('raw_outcome_score', 4, 3)->nullable();
            $table->decimal('progress_bonus', 4, 3)->default(0);
            $table->decimal('difficulty_multiplier', 4, 2)->default(1.00);
            $table->decimal('time_factor', 5, 3)->default(1.00);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['rep_id', 'visit_date']);
            $table->index(['doctor_profile_id', 'visit_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
