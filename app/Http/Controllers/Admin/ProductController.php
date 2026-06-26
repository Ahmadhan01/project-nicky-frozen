<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        return Inertia::render('Admin/Products', [
            'products'   => $query->get(),
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|unique:products,code',
            'category_id' => 'required|exists:categories,id',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'unit'        => 'required|string',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $product = Product::create($request->all());

AuditLog::record('product', "Produk \"{$product->name}\" ditambahkan", ['product_id' => $product->id, 'name' => $product->name]);

return back()->with('success', 'Produk berhasil ditambahkan!');
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|unique:products,code,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'unit'        => 'required|string',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $product->update($request->all());

AuditLog::record('product', "Produk \"{$product->name}\" diupdate", ['product_id' => $product->id, 'name' => $product->name]);

return back()->with('success', 'Produk berhasil diupdate!');
    }

    public function destroy(Product $product)
    {
        AuditLog::record('product', "Produk \"{$product->name}\" dihapus", ['product_id' => $product->id, 'name' => $product->name]);

$product->delete();

return back()->with('success', 'Produk berhasil dihapus!');
    }

    public function storeCategory(Request $request)
{
    $request->validate([
        'name'        => 'required|string|max:255|unique:categories,name',
        'description' => 'nullable|string',
    ]);

    Category::create([
        'name'        => $request->name,
        'slug'        => Str::slug($request->name),
        'description' => $request->description,
    ]);

    return back()->with('success', 'Kategori berhasil ditambahkan!');
}

public function updateCategory(Request $request, Category $category)
{
    $request->validate([
        'name'        => 'required|string|max:255|unique:categories,name,' . $category->id,
        'description' => 'nullable|string',
    ]);

    $category->update([
        'name'        => $request->name,
        'slug'        => Str::slug($request->name),
        'description' => $request->description,
    ]);

    return back()->with('success', 'Kategori berhasil diupdate!');
}

public function destroyCategory(Category $category)
{
    if ($category->products()->count() > 0) {
        return back()->withErrors(['error' => 'Kategori tidak bisa dihapus karena masih memiliki produk!']);
    }

    $category->delete();

    return back()->with('success', 'Kategori berhasil dihapus!');
}
}