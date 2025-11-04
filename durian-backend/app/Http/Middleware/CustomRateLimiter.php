<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CustomRateLimiter
{
    /**
     * Handle an incoming request with custom rate limiting
     */
    public function handle(Request $request, Closure $next, string $maxAttempts = '60', string $decayMinutes = '1'): Response
    {
        $key = $this->resolveRequestSignature($request);
        $maxAttempts = (int) $maxAttempts;
        $decayMinutes = (int) $decayMinutes;

        // Get current attempts
        $attempts = Cache::get($key, 0);

        // Check if rate limit exceeded
        if ($attempts >= $maxAttempts) {
            $retryAfter = Cache::get($key . ':timer');
            $seconds = $retryAfter ? $retryAfter - time() : $decayMinutes * 60;

            // Log rate limit violation
            \Log::warning('Rate limit exceeded', [
                'ip' => $request->ip(),
                'user_id' => $request->user()?->id,
                'endpoint' => $request->path(),
                'attempts' => $attempts,
            ]);

            return response()->json([
                'message' => 'Terlalu banyak percubaan. Sila cuba sebentar lagi.',
                'retry_after' => $seconds,
            ], 429)->header('Retry-After', $seconds);
        }

        // Increment attempts
        if ($attempts === 0) {
            $expiresAt = now()->addMinutes($decayMinutes);
            Cache::put($key, 1, $expiresAt);
            Cache::put($key . ':timer', $expiresAt->timestamp, $expiresAt);
        } else {
            Cache::increment($key);
        }

        // Add rate limit headers
        $response = $next($request);

        return $response
            ->header('X-RateLimit-Limit', $maxAttempts)
            ->header('X-RateLimit-Remaining', max(0, $maxAttempts - $attempts - 1));
    }

    /**
     * Resolve request signature for rate limiting
     */
    protected function resolveRequestSignature(Request $request): string
    {
        if ($user = $request->user()) {
            return 'rate-limit:' . $user->id . ':' . $request->path();
        }

        return 'rate-limit:' . $request->ip() . ':' . $request->path();
    }
}
