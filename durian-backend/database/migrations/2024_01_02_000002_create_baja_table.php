<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('baja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tree_id')->constrained('pokok_durian')->onDelete('cascade');
            $table->date('tarikh_baja');
            $table->string('jenis_baja');
            $table->decimal('jumlah', 8, 2); // dalam kg
            $table->foreignId('pekerja_id')->constrained('users')->onDelete('cascade');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('baja');
    }
};
