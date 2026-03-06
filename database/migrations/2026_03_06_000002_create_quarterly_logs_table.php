<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quarterly_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');       // The rep who performed the action
            $table->string('action');                                                 // 'visit_created', 'doctor_created', etc.
            $table->string('subject_type')->nullable();                              // Model class
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_name')->nullable();                              // Human-readable: "Dr. Smith", "Aspirin", etc.
            $table->string('priority')->default('normal');                           // 'low', 'normal', 'high', 'critical'
            $table->string('quarter');                                                // e.g. "2026-Q1"
            $table->json('details')->nullable();                                     // Extra context
            $table->boolean('reviewed')->default(false);                             // Manager reviewed?
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamps();

            $table->index(['quarter', 'user_id']);
            $table->index(['action', 'quarter']);
            $table->index('reviewed');
            $table->index('priority');
        });

        // Add manage permissions permission
        Schema::table('permissions', function (Blueprint $table) {
            // No schema changes needed — Spatie handles this
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quarterly_logs');
    }
};
