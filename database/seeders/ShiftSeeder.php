<?php

namespace Database\Seeders;

use App\Models\Shift;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        Shift::firstOrCreate(['name' => 'Shift Pagi'],  ['start_time' => '06:00', 'end_time' => '14:00']);
        Shift::firstOrCreate(['name' => 'Shift Malam'], ['start_time' => '14:00', 'end_time' => '21:00']);
    }
}