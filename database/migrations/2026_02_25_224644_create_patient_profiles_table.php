<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_profiles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('national_id')->nullable()->unique(); // or MRN etc.
            $table->string('blood_type', 5)->nullable(); // e.g. A+, O-
            $table->text('allergies')->nullable();
            $table->text('chronic_conditions')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id']); // enforce 1:1
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_profiles');
    }
};
