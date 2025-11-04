<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action'); // 'create', 'update', 'delete'
            $table->string('module'); // 'pokok', 'baja', 'spray', 'hasil', 'inspeksi'
            $table->unsignedBigInteger('record_id')->nullable(); // ID of affected record
            $table->string('description'); // Human-readable description
            $table->json('old_data')->nullable(); // Data before change (for update/delete)
            $table->json('new_data')->nullable(); // Data after change (for create/update)
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
