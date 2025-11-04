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
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->string('photoable_type'); // Model type (Pokok, Inspeksi, etc)
            $table->unsignedBigInteger('photoable_id'); // Model ID
            $table->string('file_path'); // Path to stored file
            $table->string('file_name'); // Original filename
            $table->string('mime_type')->nullable(); // Image type
            $table->integer('file_size')->nullable(); // File size in bytes
            $table->text('caption')->nullable(); // Optional caption
            $table->unsignedBigInteger('uploaded_by'); // User who uploaded
            $table->timestamps();

            // Indexes for better performance
            $table->index(['photoable_type', 'photoable_id']);
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};
