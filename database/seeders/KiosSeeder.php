<?php

namespace Database\Seeders;

use App\Models\Kios;
use Illuminate\Database\Seeder;

class KiosSeeder extends Seeder
{
    public function run(): void
    {
        Kios::firstOrCreate(['name' => 'Kios 1'], ['location' => 'Lokasi utama']);
        Kios::firstOrCreate(['name' => 'Kios 2'], ['location' => 'Cabang 1']);
    }
}