<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->date('tarikh');
            $table->enum('kategori', ['baja', 'racun', 'peralatan', 'pekerja', 'utiliti', 'lain-lain']);
            $table->string('item');
            $table->integer('kuantiti')->default(1);
            $table->string('unit')->nullable(); // kg, liter, pcs, dll
            $table->decimal('harga_seunit', 10, 2);
            $table->decimal('jumlah', 10, 2); // kuantiti * harga_seunit
            $table->string('pembekal')->nullable();
            $table->text('catatan')->nullable();
            $table->string('resit')->nullable(); // gambar resit
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
