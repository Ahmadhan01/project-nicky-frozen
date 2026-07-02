<?php
namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['category_id' => 1, 'code' => 'NF-001', 'name' => 'Ayam Fillet Frozen 1kg', 'price' => 35000, 'unit' => 'kg'],
            ['category_id' => 1, 'code' => 'NF-002', 'name' => 'Chicken Katsu Frozen 500g', 'price' => 28000, 'unit' => 'pack'],
            ['category_id' => 1, 'code' => 'NF-003', 'name' => 'Sayap Ayam Frozen 1kg', 'price' => 30000, 'unit' => 'kg'],
            ['category_id' => 2, 'code' => 'NF-004', 'name' => 'Udang Kupas Frozen 500g', 'price' => 45000, 'unit' => 'pack'],
            ['category_id' => 2, 'code' => 'NF-005', 'name' => 'Cumi Frozen 500g', 'price' => 38000, 'unit' => 'pack'],
            ['category_id' => 2, 'code' => 'NF-006', 'name' => 'Ikan Dori Frozen 500g', 'price' => 32000, 'unit' => 'pack'],
            ['category_id' => 3, 'code' => 'NF-007', 'name' => 'Sosis Sapi 1kg', 'price' => 42000, 'unit' => 'pack'],
            ['category_id' => 3, 'code' => 'NF-008', 'name' => 'Nugget Ayam 500g', 'price' => 25000, 'unit' => 'pack'],
            ['category_id' => 3, 'code' => 'NF-009', 'name' => 'Bakso Sapi Frozen 500g', 'price' => 22000, 'unit' => 'pack'],
            ['category_id' => 4, 'code' => 'NF-010', 'name' => 'Dimsum Ayam 20pcs', 'price' => 30000, 'unit' => 'pack'],
            ['category_id' => 4, 'code' => 'NF-011', 'name' => 'Siomay Frozen 20pcs', 'price' => 28000, 'unit' => 'pack'],
            ['category_id' => 5, 'code' => 'NF-012', 'name' => 'Edamame Frozen 500g', 'price' => 18000, 'unit' => 'pack'],
            ['category_id' => 5, 'code' => 'NF-013', 'name' => 'Kentang Goreng Frozen 1kg', 'price' => 20000, 'unit' => 'pack'],
            ['category_id' => 6, 'code' => 'NF-014', 'name' => 'Es Krim Vanilla 700ml', 'price' => 35000, 'unit' => 'pcs'],
            ['category_id' => 6, 'code' => 'NF-015', 'name' => 'Es Krim Coklat 700ml', 'price' => 35000, 'unit' => 'pcs'],
        ];

        foreach ($products as $productData) {
            $product = Product::firstOrCreate(
                ['code' => $productData['code']],
                [
                    'category_id' => $productData['category_id'],
                    'name'        => $productData['name'],
                    'price'       => $productData['price'],
                    'unit'        => $productData['unit'],
                    'is_active'   => true,
                ]
            );

            foreach (\App\Models\Kios::all() as $kios) {
                \App\Models\ProductStock::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'kios_id'    => $kios->id,
                    ],
                    [
                        'stock' => 50,
                    ]
                );
            }

            // // Buat stok per kios
            // \App\Models\ProductStock::create(['product_id' => $product->id, 'kios_id' => 1, 'stock' => 50]);
            // \App\Models\ProductStock::create(['product_id' => $product->id, 'kios_id' => 2, 'stock' => 50]);
        }
    }
}
