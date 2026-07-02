<?php

namespace Database\Seeders;

use App\Models\Kios;
use Illuminate\Database\Seeder;

class KiosSeeder extends Seeder
{
    public function run(): void
    {
        Kios::firstOrCreate(['name' => 'Kios 1'], ['location' => 'BSD City, Tangerang Selatan']);
        Kios::firstOrCreate(['name' => 'Kios 2'], ['location' => 'Bekasi Pinggiran']);
    }
}