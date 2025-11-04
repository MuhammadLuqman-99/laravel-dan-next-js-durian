<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hasil', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tree_id')->constrained('pokok_durian')->onDelete('cascade');
            $table->date('tarikh_tuai');
            $table->integer('jumlah_biji');
            $table->decimal('berat_kg', 8, 2);
            $table->enum('kualiti', ['A', 'B', 'C'])->default('B');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hasil');
    }
};
