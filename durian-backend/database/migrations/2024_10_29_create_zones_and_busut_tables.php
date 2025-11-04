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
        // Zones/Areas in the farm (e.g., Atas, Bawah, Tengah)
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Area Atas", "Area Bawah"
            $table->string('code')->unique(); // e.g., "ATAS", "BAWAH"
            $table->text('description')->nullable();
            $table->integer('total_busut')->default(0);
            $table->decimal('total_area_hectares', 10, 2)->nullable();
            $table->string('color_code')->nullable(); // For map visualization
            $table->timestamps();
        });

        // Busut Tanah (Mounds)
        Schema::create('busut', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained('zones')->onDelete('cascade');
            $table->string('busut_code')->unique(); // e.g., "ATAS-001"
            $table->integer('busut_number'); // Sequential number within zone

            // Physical dimensions
            $table->decimal('panjang', 8, 2)->nullable(); // Length in meters
            $table->decimal('lebar', 8, 2)->nullable(); // Width in meters
            $table->decimal('tinggi', 8, 2)->nullable(); // Height in meters

            // GPS coordinates (center of busut)
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Soil information
            $table->string('soil_type')->nullable(); // tanah liat, pasir, etc.
            $table->decimal('soil_ph', 4, 2)->nullable();
            $table->date('last_soil_test')->nullable();

            // Capacity
            $table->integer('capacity_trees')->default(0); // How many trees can fit
            $table->integer('current_trees')->default(0); // How many trees currently

            // Status
            $table->enum('status', ['baik', 'perlu_repair', 'perlu_naik_tanah', 'baru_buat'])->default('baik');
            $table->date('date_created')->nullable();
            $table->date('last_maintenance')->nullable();

            // Notes
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('zone_id');
            $table->index('busut_code');
            $table->index('status');
        });

        // Update pokok_durian table to link to busut
        Schema::table('pokok_durian', function (Blueprint $table) {
            $table->foreignId('busut_id')->nullable()->after('lokasi')->constrained('busut')->onDelete('set null');
            $table->string('position_in_busut')->nullable()->after('busut_id'); // e.g., "Baris 1, Pokok 3"

            $table->index('busut_id');
        });

        // Busut maintenance records
        Schema::create('busut_maintenance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('busut_id')->constrained('busut')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->enum('maintenance_type', [
                'soil_test',
                'naik_tanah',
                'repair_erosion',
                'fertilization',
                'drainage_check',
                'other'
            ]);

            $table->date('tarikh');
            $table->text('findings')->nullable(); // What was found/observed
            $table->text('actions_taken')->nullable(); // What was done
            $table->decimal('cost', 10, 2)->nullable();

            // Soil test results (if applicable)
            $table->decimal('ph_level', 4, 2)->nullable();
            $table->decimal('nitrogen', 8, 2)->nullable();
            $table->decimal('phosphorus', 8, 2)->nullable();
            $table->decimal('potassium', 8, 2)->nullable();

            $table->text('recommendations')->nullable();
            $table->timestamps();

            $table->index('busut_id');
            $table->index('tarikh');
            $table->index('maintenance_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pokok_durian', function (Blueprint $table) {
            $table->dropForeign(['busut_id']);
            $table->dropColumn(['busut_id', 'position_in_busut']);
        });

        Schema::dropIfExists('busut_maintenance');
        Schema::dropIfExists('busut');
        Schema::dropIfExists('zones');
    }
};
