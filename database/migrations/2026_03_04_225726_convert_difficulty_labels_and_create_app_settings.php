<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Change enum columns to string to allow new values
        Schema::table('doctor_profiles', function (Blueprint $table) {
            $table->string('access_difficulty', 20)->default('B')->change();
        });
        Schema::table('visits', function (Blueprint $table) {
            $table->string('access_difficulty', 20)->nullable()->change();
        });

        // 2. Convert existing difficulty values: easy→C, moderate→B, hard→A
        DB::table('doctor_profiles')->where('access_difficulty', 'easy')->update(['access_difficulty' => 'C']);
        DB::table('doctor_profiles')->where('access_difficulty', 'moderate')->update(['access_difficulty' => 'B']);
        DB::table('doctor_profiles')->where('access_difficulty', 'hard')->update(['access_difficulty' => 'A']);

        DB::table('visits')->where('access_difficulty', 'easy')->update(['access_difficulty' => 'C']);
        DB::table('visits')->where('access_difficulty', 'moderate')->update(['access_difficulty' => 'B']);
        DB::table('visits')->where('access_difficulty', 'hard')->update(['access_difficulty' => 'A']);

        // 3. Create app_settings table
        Schema::create('app_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // 3. Seed default company name
        DB::table('app_settings')->insert([
            'key' => 'company_name',
            'value' => 'Medica',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        // Reverse difficulty labels
        DB::table('doctor_profiles')->where('access_difficulty', 'C')->update(['access_difficulty' => 'easy']);
        DB::table('doctor_profiles')->where('access_difficulty', 'B')->update(['access_difficulty' => 'moderate']);
        DB::table('doctor_profiles')->where('access_difficulty', 'A')->update(['access_difficulty' => 'hard']);

        DB::table('visits')->where('access_difficulty', 'C')->update(['access_difficulty' => 'easy']);
        DB::table('visits')->where('access_difficulty', 'B')->update(['access_difficulty' => 'moderate']);
        DB::table('visits')->where('access_difficulty', 'A')->update(['access_difficulty' => 'hard']);

        // Restore enum columns
        Schema::table('doctor_profiles', function (Blueprint $table) {
            $table->enum('access_difficulty', ['easy', 'moderate', 'hard'])->default('moderate')->change();
        });
        Schema::table('visits', function (Blueprint $table) {
            $table->enum('access_difficulty', ['easy', 'moderate', 'hard'])->nullable()->change();
        });

        Schema::dropIfExists('app_settings');
    }
};
