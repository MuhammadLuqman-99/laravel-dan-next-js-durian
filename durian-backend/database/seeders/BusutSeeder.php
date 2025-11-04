<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BusutSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create Zones
        $zoneAtas = DB::table('zones')->insertGetId([
            'name' => 'Area Atas',
            'code' => 'ATAS',
            'description' => 'Kawasan atas kebun dengan 179 busut tanah',
            'total_busut' => 179,
            'total_area_hectares' => 15.0,
            'color_code' => '#10B981', // Green
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $zoneBawah = DB::table('zones')->insertGetId([
            'name' => 'Area Bawah',
            'code' => 'BAWAH',
            'description' => 'Kawasan bawah kebun dengan 50 busut tanah',
            'total_busut' => 50,
            'total_area_hectares' => 5.0,
            'color_code' => '#3B82F6', // Blue
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // Generate 179 busut for Area Atas
        $this->generateBusut($zoneAtas, 'ATAS', 179, [
            'lat_start' => 3.1390, // Example coordinates (adjust to actual location)
            'lng_start' => 101.6869,
            'lat_offset' => 0.0001, // Offset for grid layout
            'lng_offset' => 0.0001,
        ]);

        // Generate 50 busut for Area Bawah
        $this->generateBusut($zoneBawah, 'BAWAH', 50, [
            'lat_start' => 3.1350,
            'lng_start' => 101.6850,
            'lat_offset' => 0.0001,
            'lng_offset' => 0.0001,
        ]);

        $this->command->info('✅ Created 229 busut tanah (179 Atas + 50 Bawah)');
    }

    /**
     * Generate busut for a zone
     */
    private function generateBusut($zoneId, $zoneCode, $count, $coordinates)
    {
        $busutData = [];
        $soilTypes = ['Tanah Liat', 'Tanah Liat Berpasir', 'Tanah Merah', 'Tanah Organik'];
        $statuses = ['baik', 'baik', 'baik', 'perlu_repair', 'perlu_naik_tanah']; // Weighted towards 'baik'

        // Calculate grid dimensions (rough square layout)
        $cols = ceil(sqrt($count));
        $rows = ceil($count / $cols);

        $busutNumber = 1;

        for ($row = 0; $row < $rows; $row++) {
            for ($col = 0; $col < $cols; $col++) {
                if ($busutNumber > $count) break;

                // Calculate GPS coordinates in a grid pattern
                $lat = $coordinates['lat_start'] + ($row * $coordinates['lat_offset']);
                $lng = $coordinates['lng_start'] + ($col * $coordinates['lng_offset']);

                // Typical busut dimensions (with some variation)
                $panjang = rand(30, 50); // 30-50 meters
                $lebar = rand(4, 8);     // 4-8 meters width
                $tinggi = rand(40, 80) / 100; // 0.4-0.8 meters height

                // Each busut can hold 15-25 trees typically
                $capacity = rand(15, 25);

                $busutData[] = [
                    'zone_id' => $zoneId,
                    'busut_code' => sprintf('%s-%03d', $zoneCode, $busutNumber),
                    'busut_number' => $busutNumber,
                    'panjang' => $panjang,
                    'lebar' => $lebar,
                    'tinggi' => $tinggi,
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'soil_type' => $soilTypes[array_rand($soilTypes)],
                    'soil_ph' => rand(55, 70) / 10, // pH 5.5 - 7.0
                    'last_soil_test' => Carbon::now()->subMonths(rand(1, 12)),
                    'capacity_trees' => $capacity,
                    'current_trees' => 0, // Will be updated when assigning pokok
                    'status' => $statuses[array_rand($statuses)],
                    'date_created' => Carbon::now()->subYears(rand(1, 5)),
                    'last_maintenance' => Carbon::now()->subMonths(rand(1, 6)),
                    'notes' => null,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ];

                $busutNumber++;
            }
        }

        // Insert in batches of 100 for performance
        $chunks = array_chunk($busutData, 100);
        foreach ($chunks as $chunk) {
            DB::table('busut')->insert($chunk);
        }
    }
}
