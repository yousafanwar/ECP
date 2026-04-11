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
      {/* Filter Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>

            {(searchQuery || selectedCategory !== "all" || selectedBrand !== "all" || sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="px-3 py-2.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm font-medium cursor-pointer transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard product={product} key={product.product_id} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </>
  );
}
