<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SecurityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,pekerja',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log failed login attempt
            SecurityLog::logEvent(
                'login_failed',
                'warning',
                "Failed login attempt for email: {$request->email}",
                ['email' => $request->email],
                $user?->id
            );

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if IP is blocked
        if (SecurityLog::isSuspiciousIp($request->ip())) {
            SecurityLog::logEvent(
                'suspicious_login',
                'critical',
                "Login attempt from suspicious IP: {$request->ip()}",
                ['email' => $request->email],
                $user->id
            );

            return response()->json([
                'success' => false,
                'message' => 'Your account has been temporarily locked due to suspicious activity. Please contact support.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Log successful login
        SecurityLog::logEvent(
            'login_success',
            'info',
            "Successful login for {$user->name}",
            ['email' => $user->email],
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    }
}
