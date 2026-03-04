<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('visit_objectives', function (Blueprint $table) {
            $table->id();

            $table->foreignId('visit_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('objective_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            // Outcome: met / partially_met / not_met
            $table->enum('outcome', ['met', 'partially_met', 'not_met'])->nullable();

            // Outcome score: 1.0, 0.5, 0.0
            $table->decimal('outcome_score', 3, 2)->default(0.00);

            $table->timestamps();

            $table->unique(['visit_id', 'objective_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_objectives');
    }
};
