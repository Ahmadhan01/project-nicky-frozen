<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@nickyfrozen.com'],
            ['name' => 'Admin Nicky', 'password' => Hash::make('password123'), 'role' => 'admin']
        );

        User::firstOrCreate(
            ['email' => 'kasir@nickyfrozen.com'],
            ['name' => 'Kasir 1', 'password' => Hash::make('password123'), 'role' => 'kasir']
        );

        User::firstOrCreate(
            ['email' => 'owner@nickyfrozen.com'],
            ['name' => 'Owner Nicky', 'password' => Hash::make('password123'), 'role' => 'owner']
        );
    }
}