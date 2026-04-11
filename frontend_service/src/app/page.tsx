import ProductListings from "./components/ProductListings";
import { ProductItem } from "./interfaces";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:5000";

export default async function Home() {
  const response = await fetch(`${API_BASE_URL}/product`, { cache: 'no-store' });
  const result = await response.json();
  const products: ProductItem[] = result.payload ?? [];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-4 tracking-wide uppercase">New Collection</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Discover Products<br />
              <span className="text-indigo-600">You&apos;ll Love</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              Curated collections of premium products at prices that make sense. Shop with confidence.
            </p>
            <a href="#products" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
              Browse Collection
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
            <p className="text-sm text-gray-500 mt-1">Browse our full catalog</p>
          </div>
        </div>
        <ProductListings products={products} />
      </section>
    </div>
  );
}
