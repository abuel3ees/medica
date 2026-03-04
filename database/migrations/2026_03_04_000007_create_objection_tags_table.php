<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('objection_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // price, efficacy, safety, formulary, habit, competitor, not_my_patients
            $table->timestamps();
        });

        Schema::create('visit_objection_tag', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained()->cascadeOnDelete();
            $table->foreignId('objection_tag_id')->constrained()->cascadeOnDelete();
            $table->unique(['visit_id', 'objection_tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_objection_tag');
        Schema::dropIfExists('objection_tags');
    }
};
