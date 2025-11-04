<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PokokDurianController;
use App\Http\Controllers\BajaController;
use App\Http\Controllers\HasilController;
use App\Http\Controllers\InspeksiController;
use App\Http\Controllers\SprayController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\FarmSettingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\PhotoController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\SecurityController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ZoneController;
use App\Http\Controllers\BusutController;
use App\Http\Controllers\BusutMaintenanceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// QR Code - Public access (untuk scan QR code)
Route::get('pokok/{id}/qrcode', [PokokDurianController::class, 'generateQrCode']);
Route::get('pokok/{id}/view', [PokokDurianController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);

    // Pokok Durian
    Route::apiResource('pokok', PokokDurianController::class);
    Route::get('pokok-statistics', [PokokDurianController::class, 'statistics']);
    Route::get('pokok-map-data', [PokokDurianController::class, 'mapData']);
    Route::get('pokok/{id}/print-label', [PokokDurianController::class, 'printLabel']);
    Route::post('pokok/print-batch-labels', [PokokDurianController::class, 'printBatchLabels']);
    Route::get('pokok-print-all-labels', [PokokDurianController::class, 'printAllLabels']);

    // Bulk Actions
    Route::post('pokok/bulk-update-status', [PokokDurianController::class, 'bulkUpdateStatus']);
    Route::post('pokok/bulk-delete', [PokokDurianController::class, 'bulkDelete']);
    Route::get('pokok/export', [PokokDurianController::class, 'export']);

    // Zones & Busut Management
    Route::apiResource('zones', ZoneController::class);
    Route::get('zones/{id}/statistics', [ZoneController::class, 'statistics']);

    Route::apiResource('busut', BusutController::class);
    Route::get('busut-statistics', [BusutController::class, 'statistics']);
    Route::get('busut-map-data', [BusutController::class, 'mapData']);
    Route::post('busut/{id}/assign-pokok', [BusutController::class, 'assignPokok']);

    Route::apiResource('busut-maintenance', BusutMaintenanceController::class);
    Route::get('busut-maintenance-statistics', [BusutMaintenanceController::class, 'statistics']);

    // Baja
    Route::apiResource('baja', BajaController::class);

    // Hasil
    Route::apiResource('hasil', HasilController::class);
    Route::get('hasil-statistics/monthly', [HasilController::class, 'monthlyStatistics']);

    // Inspeksi
    Route::apiResource('inspeksi', InspeksiController::class);
    Route::get('inspeksi/latest/all', [InspeksiController::class, 'latestInspections']);

    // Spray/Racun
    Route::apiResource('spray', SprayController::class);
    Route::get('spray-overdue/list', [SprayController::class, 'overdueList']);
    Route::get('spray-upcoming/list', [SprayController::class, 'upcomingList']);

    // Activity Logs
    Route::get('activity-logs', [ActivityLogController::class, 'index']);
    Route::get('activity-logs/statistics', [ActivityLogController::class, 'statistics']);
    Route::get('activity-logs/{id}', [ActivityLogController::class, 'show']);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class);
    Route::get('expenses-statistics', [ExpenseController::class, 'statistics']);

    // Sales
    Route::apiResource('sales', SaleController::class);
    Route::get('sales-statistics', [SaleController::class, 'statistics']);

    // Farm Settings
    Route::get('farm-settings', [FarmSettingController::class, 'index']);
    Route::put('farm-settings', [FarmSettingController::class, 'update']);
    Route::get('farm-settings/crop-presets', [FarmSettingController::class, 'cropPresets']);

    // User Management (All users can view, only admin can modify)
    Route::get('users', [UserController::class, 'index']);
    Route::get('users/statistics', [UserController::class, 'statistics']);
    Route::get('users/{id}', [UserController::class, 'show']);
    Route::post('users', [UserController::class, 'store']); // Admin only (checked in controller)
    Route::put('users/{id}', [UserController::class, 'update']); // Admin only (checked in controller)
    Route::delete('users/{id}', [UserController::class, 'destroy']); // Admin only (checked in controller)

    // Reports (Data endpoints)
    Route::get('reports/monthly', [ReportController::class, 'monthlyReport']);
    Route::get('reports/yearly', [ReportController::class, 'yearlyReport']);
    Route::get('reports/profit-loss', [ReportController::class, 'profitLossStatement']);

    // Reports (PDF Downloads)
    Route::get('reports/monthly/pdf', [ReportController::class, 'exportMonthlyPDF']);
    Route::get('reports/yearly/pdf', [ReportController::class, 'exportYearlyPDF']);
    Route::get('reports/profit-loss/pdf', [ReportController::class, 'exportProfitLossPDF']);

    // Excel Exports
    Route::get('export/pokok', [ExportController::class, 'exportPokok']);
    Route::get('export/hasil', [ExportController::class, 'exportHasil']);
    Route::get('export/sales', [ExportController::class, 'exportSales']);
    Route::get('export/expenses', [ExportController::class, 'exportExpenses']);
    Route::get('export/all', [ExportController::class, 'exportAll']);

    // Photos
    Route::post('photos/upload', [PhotoController::class, 'upload']);
    Route::get('photos', [PhotoController::class, 'index']);
    Route::delete('photos/{id}', [PhotoController::class, 'destroy']);
    Route::put('photos/{id}/caption', [PhotoController::class, 'updateCaption']);

    // Database Backup (Admin only - checked in controller)
    Route::get('backup/download', [BackupController::class, 'downloadBackup']);
    Route::get('backup/history', [BackupController::class, 'getBackupHistory']);

    // Security & Monitoring (Admin only - checked in controller)
    Route::get('security/statistics', [SecurityController::class, 'getStatistics']);
    Route::get('security/events', [SecurityController::class, 'getRecentEvents']);
    Route::get('security/events/ip/{ip}', [SecurityController::class, 'getByIp']);
    Route::post('security/block-ip', [SecurityController::class, 'blockIp']);
    Route::post('security/unblock-ip', [SecurityController::class, 'unblockIp']);
    Route::get('security/blocked-ips', [SecurityController::class, 'getBlockedIps']);
    Route::get('security/active-sessions', [SecurityController::class, 'getActiveSessions']);
    Route::delete('security/clear-logs', [SecurityController::class, 'clearOldLogs']);

    // Profile Management
    Route::get('profile', [ProfileController::class, 'getProfile']);
    Route::put('profile', [ProfileController::class, 'updateProfile']);
    Route::post('profile/change-password', [ProfileController::class, 'changePassword']);
    Route::post('profile/upload-picture', [ProfileController::class, 'uploadProfilePicture']);
    Route::delete('profile/delete-picture', [ProfileController::class, 'deleteProfilePicture']);
    Route::get('profile/activity-log', [ProfileController::class, 'getActivityLog']);
    Route::get('profile/login-history', [ProfileController::class, 'getLoginHistory']);
    Route::get('profile/statistics', [ProfileController::class, 'getStatistics']);
});
