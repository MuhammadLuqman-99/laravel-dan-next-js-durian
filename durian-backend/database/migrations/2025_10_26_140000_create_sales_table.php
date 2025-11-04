<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->date('tarikh_jual');
            $table->string('nama_pembeli');
            $table->string('no_telefon')->nullable();
            $table->integer('jumlah_biji');
            $table->decimal('berat_kg', 10, 2);
            $table->enum('gred', ['A', 'B', 'C'])->default('B');
            $table->decimal('harga_sekg', 10, 2); // harga per kg
            $table->decimal('jumlah_harga', 10, 2); // berat_kg * harga_sekg
            $table->enum('status_bayaran', ['paid', 'pending', 'partial'])->default('paid');
            $table->decimal('jumlah_dibayar', 10, 2)->default(0);
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
