<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Ayam & Unggas',   'description' => 'Produk frozen berbahan dasar ayam dan unggas'],
            ['name' => 'Seafood',          'description' => 'Produk frozen ikan, udang, cumi, dan seafood lainnya'],
            ['name' => 'Sosis & Nugget',   'description' => 'Sosis, nugget, dan olahan daging siap masak'],
            ['name' => 'Dimsum',           'description' => 'Aneka dimsum frozen siap kukus atau goreng'],
            ['name' => 'Sayuran Frozen',   'description' => 'Aneka sayuran beku siap masak'],
            ['name' => 'Minuman & Es',     'description' => 'Es krim, minuman beku, dan sejenisnya'],
        ];

        foreach ($categories as $category) {
            Category::create([
                'name'        => $category['name'],
                'slug'        => Str::slug($category['name']),
                'description' => $category['description'],
            ]);
        }
    }
}