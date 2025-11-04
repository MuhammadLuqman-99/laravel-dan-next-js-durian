<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\ActivityLog;
use App\Models\SecurityLog;

class ProfileController extends Controller
{
    /**
     * Get user profile with statistics
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        // Get user statistics
        $stats = [
            'total_activities' => ActivityLog::where('user_id', $user->id)->count(),
            'recent_activities' => ActivityLog::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'login_count' => SecurityLog::where('user_id', $user->id)
                ->where('event_type', 'login_success')
                ->count(),
            'last_login' => SecurityLog::where('user_id', $user->id)
                ->where('event_type', 'login_success')
                ->orderBy('created_at', 'desc')
                ->first(),
        ];

        return response()->json([
            'user' => $user,
            'statistics' => $stats,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'profile_updated',
            'description' => 'Updated profile information',
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        // Check current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
                'errors' => ['current_password' => ['Password salah']],
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        // Log the password change
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'password_changed',
            'description' => 'Changed account password',
        ]);

        SecurityLog::logEvent(
            'password_changed',
            'info',
            "User {$user->name} changed their password",
            null,
            $user->id
        );

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Upload profile picture
     */
    public function uploadProfilePicture(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
        ]);

        try {
            // Delete old profile picture if exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            // Store new profile picture
            $path = $request->file('profile_picture')->store('profile-pictures', 'public');

            $user->profile_picture = $path;
            $user->save();

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'profile_picture_updated',
                'description' => 'Updated profile picture',
            ]);

            return response()->json([
                'message' => 'Profile picture uploaded successfully',
                'profile_picture_url' => url('storage/' . $path),
                'user' => $user,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload profile picture',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete profile picture
     */
    public function deleteProfilePicture(Request $request)
    {
        $user = $request->user();

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
            $user->profile_picture = null;
            $user->save();

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'profile_picture_deleted',
                'description' => 'Deleted profile picture',
            ]);

            return response()->json([
                'message' => 'Profile picture deleted successfully',
            ]);
        }

        return response()->json([
            'message' => 'No profile picture to delete',
        ], 404);
    }

    /**
     * Get user's activity log
     */
    public function getActivityLog(Request $request)
    {
        $user = $request->user();
        $limit = $request->query('limit', 50);

        $activities = ActivityLog::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($activities);
    }

    /**
     * Get user's login history
     */
    public function getLoginHistory(Request $request)
    {
        $user = $request->user();
        $limit = $request->query('limit', 20);

        $logins = SecurityLog::where('user_id', $user->id)
            ->whereIn('event_type', ['login_success', 'login_failed'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        return response()->json($logins);
    }

    /**
     * Get user statistics
     */
    public function getStatistics(Request $request)
    {
        $user = $request->user();
        $days = $request->query('days', 30);

        $startDate = now()->subDays($days);

        $stats = [
            'activities_count' => ActivityLog::where('user_id', $user->id)
                ->where('created_at', '>=', $startDate)
                ->count(),
            'activities_by_action' => ActivityLog::where('user_id', $user->id)
                ->where('created_at', '>=', $startDate)
                ->select('action', \DB::raw('count(*) as count'))
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->get(),
            'login_count' => SecurityLog::where('user_id', $user->id)
                ->where('event_type', 'login_success')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'failed_login_attempts' => SecurityLog::where('user_id', $user->id)
                ->where('event_type', 'login_failed')
                ->where('created_at', '>=', $startDate)
                ->count(),
        ];

        return response()->json($stats);
    }
}
