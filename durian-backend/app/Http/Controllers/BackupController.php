<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\ActivityLog;

class BackupController extends Controller
{
    /**
     * Generate and download database backup
     */
    public function downloadBackup(Request $request)
    {
        try {
            $user = $request->user();

            // Only admins can backup
            if ($user->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Generate filename with timestamp
            $filename = 'durian_backup_' . date('Y-m-d_His') . '.sql';
            $filepath = storage_path('app/backups/' . $filename);

            // Create backups directory if not exists
            if (!file_exists(storage_path('app/backups'))) {
                mkdir(storage_path('app/backups'), 0755, true);
            }

            // Get database configuration
            $database = env('DB_DATABASE');
            $username = env('DB_USERNAME');
            $password = env('DB_PASSWORD');
            $host = env('DB_HOST', '127.0.0.1');
            $port = env('DB_PORT', '3306');

            // Build mysqldump command
            $command = sprintf(
                'mysqldump --user=%s --password=%s --host=%s --port=%s %s > %s',
                escapeshellarg($username),
                escapeshellarg($password),
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($database),
                escapeshellarg($filepath)
            );

            // Execute backup
            exec($command, $output, $returnVar);

            if ($returnVar !== 0 || !file_exists($filepath)) {
                // Fallback: Use Laravel's DB facade to generate SQL
                $this->generateBackupWithLaravel($filepath);
            }

            // Log activity
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'backup_database',
                'description' => "Database backup created: {$filename}",
            ]);

            // Return file for download
            return response()->download($filepath, $filename)->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Backup failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fallback backup method using Laravel
     */
    private function generateBackupWithLaravel($filepath)
    {
        $sql = "-- Database Backup\n";
        $sql .= "-- Generated: " . date('Y-m-d H:i:s') . "\n\n";

        // Get all tables
        $tables = DB::select('SHOW TABLES');
        $database = env('DB_DATABASE');
        $tableKey = "Tables_in_{$database}";

        foreach ($tables as $table) {
            $tableName = $table->$tableKey;

            // Get CREATE TABLE statement
            $createTable = DB::select("SHOW CREATE TABLE `{$tableName}`");
            $sql .= "\n\n-- Table: {$tableName}\n";
            $sql .= "DROP TABLE IF EXISTS `{$tableName}`;\n";
            $sql .= $createTable[0]->{'Create Table'} . ";\n";

            // Get table data
            $rows = DB::table($tableName)->get();

            if ($rows->count() > 0) {
                $sql .= "\n-- Data for table: {$tableName}\n";

                foreach ($rows as $row) {
                    $row = (array) $row;
                    $columns = implode('`, `', array_keys($row));
                    $values = array_map(function($value) {
                        if (is_null($value)) {
                            return 'NULL';
                        }
                        return "'" . addslashes($value) . "'";
                    }, array_values($row));

                    $sql .= "INSERT INTO `{$tableName}` (`{$columns}`) VALUES (" . implode(', ', $values) . ");\n";
                }
            }
        }

        file_put_contents($filepath, $sql);
    }

    /**
     * Get backup history
     */
    public function getBackupHistory(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->role !== 'admin') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $backups = ActivityLog::where('action', 'backup_database')
                ->with('user:id,name')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->map(function($log) {
                    return [
                        'id' => $log->id,
                        'filename' => $this->extractFilename($log->description),
                        'created_by' => $log->user->name,
                        'created_at' => $log->created_at->format('d M Y, H:i'),
                        'timestamp' => $log->created_at->toISOString(),
                    ];
                });

            return response()->json($backups);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to get backup history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Extract filename from description
     */
    private function extractFilename($description)
    {
        if (preg_match('/: (.+)$/', $description, $matches)) {
            return $matches[1];
        }
        return 'Unknown';
    }
}
