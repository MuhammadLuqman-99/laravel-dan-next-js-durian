<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add indexes for optimizing queries on large datasets (1000+ records)
     */
    public function up(): void
    {
        // Use raw SQL to avoid duplicate index errors
        $indexes = [
            // Pokok Durian
            "CREATE INDEX IF NOT EXISTS `pokok_durian_varieti_index` ON `pokok_durian` (`varieti`)",
            "CREATE INDEX IF NOT EXISTS `pokok_durian_lokasi_index` ON `pokok_durian` (`lokasi`)",
            "CREATE INDEX IF NOT EXISTS `pokok_durian_status_kesihatan_index` ON `pokok_durian` (`status_kesihatan`)",
            "CREATE INDEX IF NOT EXISTS `pokok_durian_tarikh_tanam_index` ON `pokok_durian` (`tarikh_tanam`)",
            "CREATE INDEX IF NOT EXISTS `pokok_durian_created_at_index` ON `pokok_durian` (`created_at`)",

            // Hasil
            "CREATE INDEX IF NOT EXISTS `hasil_tree_id_index` ON `hasil` (`tree_id`)",
            "CREATE INDEX IF NOT EXISTS `hasil_tarikh_tuai_index` ON `hasil` (`tarikh_tuai`)",
            "CREATE INDEX IF NOT EXISTS `hasil_kualiti_index` ON `hasil` (`kualiti`)",
            "CREATE INDEX IF NOT EXISTS `hasil_created_at_index` ON `hasil` (`created_at`)",

            // Baja
            "CREATE INDEX IF NOT EXISTS `baja_tree_id_index` ON `baja` (`tree_id`)",
            "CREATE INDEX IF NOT EXISTS `baja_pekerja_id_index` ON `baja` (`pekerja_id`)",
            "CREATE INDEX IF NOT EXISTS `baja_tarikh_baja_index` ON `baja` (`tarikh_baja`)",
            "CREATE INDEX IF NOT EXISTS `baja_created_at_index` ON `baja` (`created_at`)",

            // Inspeksi
            "CREATE INDEX IF NOT EXISTS `inspeksi_tree_id_index` ON `inspeksi` (`tree_id`)",
            "CREATE INDEX IF NOT EXISTS `inspeksi_tarikh_inspeksi_index` ON `inspeksi` (`tarikh_inspeksi`)",
            "CREATE INDEX IF NOT EXISTS `inspeksi_status_index` ON `inspeksi` (`status`)",
            "CREATE INDEX IF NOT EXISTS `inspeksi_created_at_index` ON `inspeksi` (`created_at`)",

            // Spray
            "CREATE INDEX IF NOT EXISTS `spray_tree_id_index` ON `spray` (`tree_id`)",
            "CREATE INDEX IF NOT EXISTS `spray_tarikh_spray_index` ON `spray` (`tarikh_spray`)",
            "CREATE INDEX IF NOT EXISTS `spray_jenis_index` ON `spray` (`jenis`)",
            "CREATE INDEX IF NOT EXISTS `spray_created_at_index` ON `spray` (`created_at`)",

            // Expenses
            "CREATE INDEX IF NOT EXISTS `expenses_kategori_index` ON `expenses` (`kategori`)",
            "CREATE INDEX IF NOT EXISTS `expenses_tarikh_index` ON `expenses` (`tarikh`)",
            "CREATE INDEX IF NOT EXISTS `expenses_created_at_index` ON `expenses` (`created_at`)",

            // Sales
            "CREATE INDEX IF NOT EXISTS `sales_tarikh_jual_index` ON `sales` (`tarikh_jual`)",
            "CREATE INDEX IF NOT EXISTS `sales_gred_index` ON `sales` (`gred`)",
            "CREATE INDEX IF NOT EXISTS `sales_status_bayaran_index` ON `sales` (`status_bayaran`)",
            "CREATE INDEX IF NOT EXISTS `sales_created_at_index` ON `sales` (`created_at`)",

            // Activity Logs
            "CREATE INDEX IF NOT EXISTS `activity_logs_user_id_index` ON `activity_logs` (`user_id`)",
            "CREATE INDEX IF NOT EXISTS `activity_logs_action_index` ON `activity_logs` (`action`)",
            "CREATE INDEX IF NOT EXISTS `activity_logs_module_index` ON `activity_logs` (`module`)",
            "CREATE INDEX IF NOT EXISTS `activity_logs_created_at_index` ON `activity_logs` (`created_at`)",

            // Security Logs
            "CREATE INDEX IF NOT EXISTS `security_logs_user_id_index` ON `security_logs` (`user_id`)",
            "CREATE INDEX IF NOT EXISTS `security_logs_event_type_index` ON `security_logs` (`event_type`)",
            "CREATE INDEX IF NOT EXISTS `security_logs_ip_address_index` ON `security_logs` (`ip_address`)",
            "CREATE INDEX IF NOT EXISTS `security_logs_severity_index` ON `security_logs` (`severity`)",
            "CREATE INDEX IF NOT EXISTS `security_logs_is_blocked_index` ON `security_logs` (`is_blocked`)",
            "CREATE INDEX IF NOT EXISTS `security_logs_created_at_index` ON `security_logs` (`created_at`)",

            // Users
            "CREATE INDEX IF NOT EXISTS `users_role_index` ON `users` (`role`)",
        ];

        foreach ($indexes as $sql) {
            try {
                DB::statement($sql);
            } catch (\Exception $e) {
                // Index might already exist, skip
                if (!str_contains($e->getMessage(), 'Duplicate key name')) {
                    throw $e;
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $indexes = [
            'users' => ['role'],
            'security_logs' => ['user_id', 'event_type', 'ip_address', 'severity', 'is_blocked', 'created_at'],
            'activity_logs' => ['user_id', 'action', 'module', 'created_at'],
            'sales' => ['tarikh_jual', 'gred', 'status_bayaran', 'created_at'],
            'expenses' => ['kategori', 'tarikh', 'created_at'],
            'spray' => ['tree_id', 'tarikh_spray', 'jenis', 'created_at'],
            'inspeksi' => ['tree_id', 'tarikh_inspeksi', 'status', 'created_at'],
            'baja' => ['tree_id', 'pekerja_id', 'tarikh_baja', 'created_at'],
            'hasil' => ['tree_id', 'tarikh_tuai', 'kualiti', 'created_at'],
            'pokok_durian' => ['varieti', 'lokasi', 'status_kesihatan', 'tarikh_tanam', 'created_at'],
        ];

        foreach ($indexes as $table => $columns) {
            Schema::table($table, function (Blueprint $blueprint) use ($columns) {
                foreach ($columns as $column) {
                    try {
                        $blueprint->dropIndex([$column]);
                    } catch (\Exception $e) {
                        // Index might not exist, skip
                    }
                }
            });
        }
    }
};
