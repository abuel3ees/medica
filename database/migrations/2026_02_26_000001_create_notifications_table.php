<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // ai_insight, visit_reminder, score_alert, system, admin_message
            $table->string('title');
            $table->text('body');
            $table->json('data')->nullable(); // extra payload: links, action buttons, etc.
            $table->string('icon')->nullable(); // lucide icon name
            $table->string('priority')->default('normal'); // low, normal, high, urgent
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
