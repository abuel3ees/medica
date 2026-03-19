<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctor_profiles', function (Blueprint $table) {
            $table->string('institution')->nullable()->after('specialty');
            $table->string('location')->nullable()->after('institution');
            $table->enum('segment', ['A', 'B', 'C'])->default('B')->after('location');
            $table->enum('stance', ['supportive', 'neutral', 'resistant'])->default('neutral')->after('segment');
            $table->enum('access_difficulty', ['easy', 'moderate', 'hard'])->default('moderate')->after('stance');
            $table->decimal('difficulty_multiplier', 4, 2)->default(1.00)->after('access_difficulty');
        });
    }

    public function down(): void
    {
        Schema::table('doctor_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'institution',
                'location',
                'segment',
                'stance',
                'access_difficulty',
                'difficulty_multiplier',
            ]);
        });
    }
};
