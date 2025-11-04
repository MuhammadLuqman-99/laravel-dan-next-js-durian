<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add GPS coordinates for farm map visualization
     */
    public function up(): void
    {
        Schema::table('pokok_durian', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('lokasi');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('gps_accuracy', 20)->nullable()->after('longitude'); // GPS accuracy in meters
            $table->timestamp('gps_captured_at')->nullable()->after('gps_accuracy');

            // Add index for geospatial queries
            $table->index(['latitude', 'longitude'], 'pokok_durian_gps_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pokok_durian', function (Blueprint $table) {
            $table->dropIndex('pokok_durian_gps_index');
            $table->dropColumn(['latitude', 'longitude', 'gps_accuracy', 'gps_captured_at']);
        });
    }
};
