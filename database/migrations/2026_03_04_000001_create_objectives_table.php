<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('objectives', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // e.g. "Secure next appointment"
            $table->string('category')->nullable();     // e.g. "clinical", "access", "relationship"
            $table->enum('importance', ['high', 'standard', 'low'])->default('standard');
            $table->decimal('weight', 3, 2)->default(1.00); // high=1.3, standard=1.0, low=0.7
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('objectives');
    }
};
