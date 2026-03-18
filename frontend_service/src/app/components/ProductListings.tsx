'use client';

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { ProductItem } from "../interfaces";

interface ProductListingsProps {
  products: ProductItem[];
}

export default function ProductListings({ products }: ProductListingsProps) {
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const categories = [...new Set(products.map((p) => p.category_title).filter(Boolean))].sort() as string[];
  const brands = [...new Set(products.map((p) => p.brand_title).filter(Boolean))].sort() as string[];

  useEffect(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category_title === selectedCategory);
    }

    if (selectedBrand !== "all") {
      result = result.filter((p) => p.brand_title === selectedBrand);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "newest":
        default:
          return 0;
      }
    });

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, selectedBrand, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSortBy("newest");
  };

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 flex-wrap items-center justify-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium cursor-pointer transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <div className="text-center text-sm text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          {filteredProducts.map((product) => (
            <ProductCard product={product} key={product.product_id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">No products found. Try adjusting your filters.</p>
        </div>
      )}
    </>
  );
}
