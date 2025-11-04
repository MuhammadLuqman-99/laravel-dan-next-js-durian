<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait PaginationTrait
{
    /**
     * Get pagination size from request with defaults for large datasets
     *
     * @param Request $request
     * @param int $default Default items per page (50 for large farms)
     * @param int $max Maximum items per page (100 to prevent performance issues)
     * @return int
     */
    protected function getPaginationSize(Request $request, int $default = 50, int $max = 100): int
    {
        $perPage = $request->get('per_page', $default);
        return min($perPage, $max);
    }
}
