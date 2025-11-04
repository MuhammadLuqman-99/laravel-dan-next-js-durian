<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farm_settings', function (Blueprint $table) {
            $table->id();
            $table->string('farm_name')->default('Kebun Saya');
            $table->string('crop_type')->default('durian'); // durian, pisang, rambutan, mangga, sayur, dll
            $table->string('crop_label_singular')->default('Pokok'); // Pokok, Tanaman, Batang
            $table->string('crop_label_plural')->default('Pokok'); // Pokok-pokok, Tanaman-tanaman
            $table->string('unit_weight')->default('kg'); // kg, tan, guni
            $table->string('unit_quantity')->default('biji'); // biji, tandan, kerat
            $table->string('owner_name')->nullable();
            $table->string('contact_number')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // Insert default settings
        DB::table('farm_settings')->insert([
            'farm_name' => 'Kebun Durian',
            'crop_type' => 'durian',
            'crop_label_singular' => 'Pokok Durian',
            'crop_label_plural' => 'Pokok Durian',
            'unit_weight' => 'kg',
            'unit_quantity' => 'biji',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('farm_settings');
    }
};
