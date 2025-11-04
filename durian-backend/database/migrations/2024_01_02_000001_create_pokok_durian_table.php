<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pokok_durian', function (Blueprint $table) {
            $table->id();
            $table->string('tag_no')->unique();
            $table->string('varieti');
            $table->integer('umur'); // dalam tahun
            $table->string('lokasi');
            $table->date('tarikh_tanam');
            $table->enum('status_kesihatan', ['sihat', 'sederhana', 'kurang sihat', 'kritikal'])->default('sihat');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pokok_durian');
    }
};
