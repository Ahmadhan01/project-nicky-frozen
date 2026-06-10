<?php

namespace Database\Seeders;

use App\Models\Shift;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         Shift::create(['name' => 'Shift Pagi',  'start_time' => '06:00', 'end_time' => '14:00']);
        Shift::create(['name' => 'Shift Malam', 'start_time' => '14:00', 'end_time' => '21:00']);
    }
}
