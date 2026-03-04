<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feature_flags', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // demo_mode, ai_coaching, pdf_import, etc.
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('enabled')->default(true);
            $table->json('metadata')->nullable(); // extra config for the flag
            $table->timestamps();
        });

        // Seed default flags
        DB::table('feature_flags')->insert([
            ['key' => 'demo_mode', 'name' => 'Demo Mode', 'description' => 'Show demo login credentials on login and landing pages', 'enabled' => true, 'metadata' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'ai_coaching', 'name' => 'AI Coaching', 'description' => 'Enable AI coach chatbot and contextual insights', 'enabled' => true, 'metadata' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'pdf_import', 'name' => 'PDF Medication Import', 'description' => 'Allow managers to upload medication PDFs', 'enabled' => true, 'metadata' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'notifications', 'name' => 'Notifications', 'description' => 'Enable the notification system', 'enabled' => true, 'metadata' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'onboarding_tutorial', 'name' => 'Onboarding Tutorial', 'description' => 'Show step-by-step tutorial for new users', 'enabled' => true, 'metadata' => null, 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'registration', 'name' => 'User Registration', 'description' => 'Allow public registration (should be disabled in production)', 'enabled' => false, 'metadata' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_flags');
    }
};
