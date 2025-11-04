<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecurityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_type',
        'severity',
        'ip_address',
        'user_agent',
        'user_id',
        'endpoint',
        'method',
        'description',
        'metadata',
        'is_blocked',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_blocked' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that triggered the security event
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log a security event
     */
    public static function logEvent(
        string $eventType,
        string $severity = 'info',
        ?string $description = null,
        ?array $metadata = null,
        ?int $userId = null
    ): self {
        return self::create([
            'event_type' => $eventType,
            'severity' => $severity,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'user_id' => $userId ?? auth()->id(),
            'endpoint' => request()->path(),
            'method' => request()->method(),
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Get recent critical events
     */
    public static function getRecentCritical(int $limit = 10)
    {
        return self::where('severity', 'critical')
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get events by IP address
     */
    public static function getByIp(string $ip, int $hours = 24)
    {
        return self::where('ip_address', $ip)
            ->where('created_at', '>=', now()->subHours($hours))
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check if IP is suspicious (multiple failed attempts)
     */
    public static function isSuspiciousIp(string $ip, int $threshold = 5): bool
    {
        $failedAttempts = self::where('ip_address', $ip)
            ->whereIn('event_type', ['login_failed', 'rate_limit', 'unauthorized_access'])
            ->where('created_at', '>=', now()->subHour())
            ->count();

        return $failedAttempts >= $threshold;
    }

    /**
     * Get statistics for security dashboard
     */
    public static function getStatistics(int $days = 7): array
    {
        $startDate = now()->subDays($days);

        return [
            'total_events' => self::where('created_at', '>=', $startDate)->count(),
            'critical_events' => self::where('severity', 'critical')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'blocked_ips' => self::where('is_blocked', true)
                ->where('created_at', '>=', $startDate)
                ->distinct('ip_address')
                ->count('ip_address'),
            'login_failures' => self::where('event_type', 'login_failed')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'rate_limit_hits' => self::where('event_type', 'rate_limit')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'top_threats' => self::where('created_at', '>=', $startDate)
                ->where('severity', '!=', 'info')
                ->select('ip_address', \DB::raw('count(*) as count'))
                ->groupBy('ip_address')
                ->orderBy('count', 'desc')
                ->limit(10)
                ->get(),
        ];
    }
}
