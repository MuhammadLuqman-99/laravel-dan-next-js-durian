<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SecurityLog;
use App\Models\User;

class SecurityController extends Controller
{
    /**
     * Get security dashboard statistics
     */
    public function getStatistics(Request $request)
    {
        // Admin only
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $days = $request->query('days', 7);
        $stats = SecurityLog::getStatistics($days);

        return response()->json($stats);
    }

    /**
     * Get recent security events
     */
    public function getRecentEvents(Request $request)
    {
        // Admin only
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $limit = $request->query('limit', 50);
        $severity = $request->query('severity');

        $query = SecurityLog::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($severity) {
            $query->where('severity', $severity);
        }

        $events = $query->get();

        return response()->json($events);
    }

    /**
     * Get events by IP address
     */
    public function getByIp(Request $request, string $ip)
    {
        // Admin only
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $hours = $request->query('hours', 24);
        $events = SecurityLog::getByIp($ip, $hours);

        return response()->json([
            'ip' => $ip,
            'is_suspicious' => SecurityLog::isSuspiciousIp($ip),
            'events' => $events,
        ]);
    }

    /**
     * Block an IP address
     */
    public function blockIp(Request $request)
    {
        // Admin only
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'ip_address' => 'required|ip',
            'reason' => 'required|string|max:500',
        ]);

        // Log the block event
        SecurityLog::logEvent(
            'ip_blocked',
            'warning',
            "IP {$request->ip_address} blocked: {$request->reason}",
            ['blocked_ip' => $request->ip_address, 'reason' => $request->reason]
        );

        // Mark all events from this IP as blocked
        SecurityLog::where('ip_address', $request->ip_address)
            ->update(['is_blocked' => true]);

        return response()->json([
            'message' => 'IP address blocked successfully',
            'ip_address' => $request->ip_address,
        ]);
    }

    /**
     * Unblock an IP address
     */
    public function unblockIp(Request $request)
    {
        // Admin only
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'ip_address' => 'required|ip',
        ]);

        SecurityLog::where('ip_address', $request->ip_address)
            ->update(['is_blocked' => false]);

        SecurityLog::logEvent(
            'ip_unblocked',
            'info',
            "IP {$request->ip_address} unblocked",
            ['unblocked_ip' => $request->ip_address]
        );

        return response()->json([
            'message' => 'IP address unblocked successfully',
            'ip_address' => $request->ip_address,
        ]);
    }

    /**
     * Get list of blocked IPs
     */
    public function getBlockedIps(Request $request)
    {
        // Admin only
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $blockedIps = SecurityLog::where('is_blocked', true)
            ->select('ip_address', \DB::raw('MAX(created_at) as last_seen'), \DB::raw('COUNT(*) as event_count'))
            ->groupBy('ip_address')
            ->orderBy('last_seen', 'desc')
            ->get();

        return response()->json($blockedIps);
    }

    /**
     * Get active user sessions
     */
    public function getActiveSessions(Request $request)
    {
        // Admin only
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get users who logged in recently (last 24 hours)
        $activeSessions = SecurityLog::where('event_type', 'login_success')
            ->where('created_at', '>=', now()->subDay())
            ->with('user:id,name,email')
            ->select('user_id', 'ip_address', 'user_agent', \DB::raw('MAX(created_at) as last_activity'))
            ->groupBy('user_id', 'ip_address', 'user_agent')
            ->orderBy('last_activity', 'desc')
            ->get();

        return response()->json($activeSessions);
    }

    /**
     * Clear old security logs
     */
    public function clearOldLogs(Request $request)
    {
        // Admin only
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $days = $request->query('days', 90);

        $deleted = SecurityLog::where('created_at', '<', now()->subDays($days))
            ->where('severity', 'info') // Keep warnings and critical
            ->delete();

        SecurityLog::logEvent(
            'logs_cleared',
            'info',
            "Cleared {$deleted} old security logs (older than {$days} days)"
        );

        return response()->json([
            'message' => 'Old logs cleared successfully',
            'deleted_count' => $deleted,
        ]);
    }
}
