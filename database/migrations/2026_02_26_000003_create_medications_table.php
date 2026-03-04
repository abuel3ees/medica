<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->text('description')->nullable();
            $table->text('indications')->nullable();
            $table->text('dosage')->nullable();
            $table->text('side_effects')->nullable();
            $table->text('contraindications')->nullable();
            $table->string('pdf_path')->nullable();
            $table->longText('extracted_text')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medications');
    }
};
