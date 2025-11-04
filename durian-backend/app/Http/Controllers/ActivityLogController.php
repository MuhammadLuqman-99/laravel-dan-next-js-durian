<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user')->latest();

        // Filter by module
        if ($request->has('module')) {
            $query->where('module', $request->module);
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }

    public function show($id)
    {
        $log = ActivityLog::with('user')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }

    public function statistics()
    {
        $stats = [
            'total_activities' => ActivityLog::count(),
            'by_action' => ActivityLog::selectRaw('action, count(*) as count')
                ->groupBy('action')
                ->get(),
            'by_module' => ActivityLog::selectRaw('module, count(*) as count')
                ->groupBy('module')
                ->get(),
            'recent_activities' => ActivityLog::with('user')
                ->latest()
                ->take(10)
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
