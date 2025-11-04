<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('security_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type'); // login_failed, rate_limit, suspicious_activity, etc.
            $table->string('severity')->default('info'); // info, warning, critical
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('endpoint')->nullable();
            $table->string('method', 10)->nullable(); // GET, POST, etc.
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Additional context
            $table->boolean('is_blocked')->default(false);
            $table->timestamps();

            $table->index(['event_type', 'created_at']);
            $table->index(['ip_address', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index('severity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('security_logs');
    }
};
