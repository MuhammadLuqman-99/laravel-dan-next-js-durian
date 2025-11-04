<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tree_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tree_id')->constrained('pokok_durian')->onDelete('cascade');
            $table->date('tarikh_ukur');

            // Canopy Metrics
            $table->decimal('canopy_diameter', 5, 2)->nullable()->comment('Diameter canopy in meters');
            $table->decimal('canopy_height', 5, 2)->nullable()->comment('Height of canopy in meters');
            $table->enum('canopy_density', ['sparse', 'medium', 'dense'])->nullable();
            $table->integer('leaf_color_score')->nullable()->comment('1-10 scale, 10 = darkest green');
            $table->integer('new_shoot_count')->nullable()->comment('Number of new shoots');

            // Trunk Metrics
            $table->decimal('trunk_circumference', 6, 2)->nullable()->comment('Circumference at 1m height in cm');
            $table->decimal('trunk_growth_rate', 5, 2)->nullable()->comment('Growth rate cm/year');
            $table->enum('bark_condition', ['smooth', 'cracked', 'peeling', 'diseased'])->nullable();

            // Root Zone Metrics
            $table->decimal('drip_line_radius', 5, 2)->nullable()->comment('Radius of canopy drip line in meters');
            $table->integer('visible_root_count')->nullable();
            $table->enum('soil_moisture', ['dry', 'moist', 'wet', 'waterlogged'])->nullable();
            $table->decimal('mulch_thickness', 4, 2)->nullable()->comment('Mulch thickness in cm');

            // Environmental Metrics
            $table->decimal('sun_exposure_hours', 4, 2)->nullable()->comment('Hours of direct sunlight per day');
            $table->decimal('distance_nearest_tree', 5, 2)->nullable()->comment('Distance to nearest tree in meters');
            $table->decimal('slope_angle', 4, 2)->nullable()->comment('Slope angle in degrees');
            $table->decimal('distance_to_water', 6, 2)->nullable()->comment('Distance to water source in meters');

            // Calculated Scores (auto-computed)
            $table->decimal('vitality_score', 5, 2)->nullable()->comment('Overall health score 0-100');
            $table->decimal('growth_rate_score', 5, 2)->nullable()->comment('Growth performance score');
            $table->decimal('stress_indicator', 5, 2)->nullable()->comment('Stress level 0-100');

            // Notes
            $table->string('pengukur')->nullable()->comment('Who measured');
            $table->text('catatan')->nullable();

            $table->timestamps();

            // Indexes for analytics
            $table->index('tarikh_ukur');
            $table->index(['tree_id', 'tarikh_ukur']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tree_measurements');
    }
};
