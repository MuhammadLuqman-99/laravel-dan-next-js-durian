<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spray', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tree_id')->constrained('pokok_durian')->onDelete('cascade');
            $table->date('tarikh_spray');
            $table->enum('jenis', ['racun', 'foliar', 'pesticide', 'fungicide', 'lain-lain'])->default('racun');
            $table->string('nama_bahan'); // Brand/name of spray
            $table->string('dosage')->nullable(); // e.g., "50ml per liter"
            $table->integer('interval_hari')->default(14); // Days until next spray needed
            $table->string('pekerja'); // Who did the spraying
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spray');
    }
};
