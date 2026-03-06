<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('doctor_profiles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('license_number')->nullable()->unique();
            $table->string('specialty')->nullable(); // could become FK later
            $table->unsignedSmallInteger('years_of_experience')->nullable();

            $table->text('bio')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id']); // enforce 1:1
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('doctor_profiles');
    }
};
