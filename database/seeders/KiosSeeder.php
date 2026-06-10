<?php

namespace Database\Seeders;

use App\Models\Kios;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KiosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Kios::create(['name' => 'Kios 1', 'location' => 'Lokasi utama']);
        Kios::create(['name' => 'Kios 2', 'location' => 'Cabang 1']);
    }
}
