<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inspeksi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tree_id')->constrained('pokok_durian')->onDelete('cascade');
            $table->date('tarikh_inspeksi');
            $table->string('pemeriksa');
            $table->enum('status', ['sihat', 'sederhana', 'kurang sihat', 'kritikal'])->default('sihat');
            $table->text('tindakan')->nullable();
            $table->string('gambar')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inspeksi');
    }
};
