<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Admin Nicky',
            'email'    => 'admin@nickyfrozen.com',
            'password' => Hash::make('password123'),
            'role'     => 'admin',
        ]);

        User::create([
            'name'     => 'Kasir 1',
            'email'    => 'kasir@nickyfrozen.com',
            'password' => Hash::make('password123'),
            'role'     => 'kasir',
        ]);

        User::create([
    'name'     => 'Owner Nicky',
    'email'    => 'owner@nickyfrozen.com',
    'password' => Hash::make('password123'),
    'role'     => 'owner',
]);
    }
}