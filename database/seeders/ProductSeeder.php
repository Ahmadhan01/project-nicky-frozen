<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // Ayam & Unggas (category_id: 1)
            ['category_id' => 1, 'code' => 'NF-001', 'name' => 'Ayam Fillet Frozen 1kg',    'price' => 35000,  'stock' => 50, 'unit' => 'kg'],
            ['category_id' => 1, 'code' => 'NF-002', 'name' => 'Chicken Katsu Frozen 500g',  'price' => 28000,  'stock' => 40, 'unit' => 'pack'],
            ['category_id' => 1, 'code' => 'NF-003', 'name' => 'Sayap Ayam Frozen 1kg',      'price' => 30000,  'stock' => 35, 'unit' => 'kg'],

            // Seafood (category_id: 2)
            ['category_id' => 2, 'code' => 'NF-004', 'name' => 'Udang Kupas Frozen 500g',    'price' => 45000,  'stock' => 30, 'unit' => 'pack'],
            ['category_id' => 2, 'code' => 'NF-005', 'name' => 'Cumi Frozen 500g',           'price' => 38000,  'stock' => 25, 'unit' => 'pack'],
            ['category_id' => 2, 'code' => 'NF-006', 'name' => 'Ikan Dori Frozen 500g',      'price' => 32000,  'stock' => 30, 'unit' => 'pack'],

            // Sosis & Nugget (category_id: 3)
            ['category_id' => 3, 'code' => 'NF-007', 'name' => 'Sosis Sapi 1kg',             'price' => 42000,  'stock' => 60, 'unit' => 'pack'],
            ['category_id' => 3, 'code' => 'NF-008', 'name' => 'Nugget Ayam 500g',           'price' => 25000,  'stock' => 55, 'unit' => 'pack'],
            ['category_id' => 3, 'code' => 'NF-009', 'name' => 'Bakso Sapi Frozen 500g',     'price' => 22000,  'stock' => 70, 'unit' => 'pack'],

            // Dimsum (category_id: 4)
            ['category_id' => 4, 'code' => 'NF-010', 'name' => 'Dimsum Ayam 20pcs',          'price' => 30000,  'stock' => 40, 'unit' => 'pack'],
            ['category_id' => 4, 'code' => 'NF-011', 'name' => 'Siomay Frozen 20pcs',        'price' => 28000,  'stock' => 35, 'unit' => 'pack'],

            // Sayuran Frozen (category_id: 5)
            ['category_id' => 5, 'code' => 'NF-012', 'name' => 'Edamame Frozen 500g',        'price' => 18000,  'stock' => 45, 'unit' => 'pack'],
            ['category_id' => 5, 'code' => 'NF-013', 'name' => 'Kentang Goreng Frozen 1kg',  'price' => 20000,  'stock' => 50, 'unit' => 'pack'],

            // Minuman & Es (category_id: 6)
            ['category_id' => 6, 'code' => 'NF-014', 'name' => 'Es Krim Vanilla 700ml',      'price' => 35000,  'stock' => 20, 'unit' => 'pcs'],
            ['category_id' => 6, 'code' => 'NF-015', 'name' => 'Es Krim Coklat 700ml',       'price' => 35000,  'stock' => 20, 'unit' => 'pcs'],
        ];

        foreach ($products as $product) {
            Product::create([
                'category_id' => $product['category_id'],
                'code'        => $product['code'],
                'name'        => $product['name'],
                'price'       => $product['price'],
                'stock'       => $product['stock'],
                'unit'        => $product['unit'],
                'is_active'   => true,
            ]);
        }
    }
}