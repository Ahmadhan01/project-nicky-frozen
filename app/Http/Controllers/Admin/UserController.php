<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Kios;
use App\Models\Shift;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
{
    $users = User::where('role', '!=', 'owner')
        ->with(['defaultKios', 'defaultShift'])
        ->get()
        ->map(function ($user) {
            $stats = Transaction::where('user_id', $user->id)
                ->where('status', 'completed')
                ->selectRaw('COUNT(*) as total_count, SUM(total_amount) as total_revenue')
                ->first();

            return [
                'id'              => $user->id,
                'name'            => $user->name,
                'username'        => $user->username,
                'email'           => $user->email,
                'role'            => $user->role,
                'avatar_color'    => $user->avatar_color,
                'notes'           => $user->notes,
                'default_kios'    => $user->defaultKios,
                'default_shift'   => $user->defaultShift,
                'is_online'       => $user->isOnline(),
                'last_active_at'  => $user->last_active_at,
                'total_count'     => $stats->total_count ?? 0,
                'total_revenue'   => $stats->total_revenue ?? 0,
            ];
        });

    return Inertia::render('Admin/Master', [
        'users'    => $users,
        'kiosList' => Kios::all(),
        'shifts'   => Shift::all(),
    ]);
}

public function store(Request $request)
{
    $request->validate([
        'name'             => 'required|string|max:255',
        'username'         => 'required|string|max:255|unique:users,username',
        'password'         => 'required|string|min:6',
        'role'             => 'required|in:admin,kasir',
        'default_kios_id'  => 'nullable|exists:kios,id',
        'default_shift_id' => 'nullable|exists:shifts,id',
        'avatar_color'     => 'required|string',
        'notes'            => 'nullable|string',
    ]);

    $user = User::create([
        'name'             => $request->name,
        'username'         => $request->username,
        'email'            => $request->username . '@nickyfrozen.com',
        'password'         => Hash::make($request->password),
        'role'             => $request->role,
        'default_kios_id'  => $request->default_kios_id,
        'default_shift_id' => $request->default_shift_id,
        'avatar_color'     => $request->avatar_color,
        'notes'            => $request->notes,
    ]);

    AuditLog::record('user', "Akun baru ditambahkan: {$user->name} (@{$user->username}) sebagai {$user->role}", ['user_id' => $user->id]);

    return back()->with('success', 'Akun berhasil ditambahkan!');
}

public function update(Request $request, User $user)
{
    $request->validate([
        'name'             => 'required|string|max:255',
        'username'         => 'required|string|max:255|unique:users,username,' . $user->id,
        'password'         => 'nullable|string|min:6',
        'role'             => 'required|in:admin,kasir',
        'default_kios_id'  => 'nullable|exists:kios,id',
        'default_shift_id' => 'nullable|exists:shifts,id',
        'avatar_color'     => 'required|string',
        'notes'            => 'nullable|string',
    ]);

    $data = $request->only(['name', 'username', 'role', 'default_kios_id', 'default_shift_id', 'avatar_color', 'notes']);
    $data['email'] = $request->username . '@nickyfrozen.com';

    if ($request->password) {
        $data['password'] = Hash::make($request->password);
    }

    $user->update($data);

    AuditLog::record('user', "Data akun diperbarui: {$user->name} (@{$user->username}) role: {$user->role}", ['user_id' => $user->id]);

    return back()->with('success', 'Akun berhasil diupdate!');
}

    public function destroy(User $user)
    {
        if ($user->role !== 'kasir') {
            return back()->withErrors(['error' => 'Hanya kasir yang bisa dihapus.']);
        }

        $name = $user->name;
        $user->delete();

        AuditLog::record('user', "Kasir dihapus: {$name}");

        return back()->with('success', 'Kasir berhasil dihapus!');
    }
}