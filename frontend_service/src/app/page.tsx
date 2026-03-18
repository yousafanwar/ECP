import ProductListings from "./components/ProductListings";
import { ProductItem } from "./interfaces";

export default async function Home() {
  const response = await fetch(`http://localhost:5000/product`, { cache: 'no-store' });
  const result = await response.json();
  const products: ProductItem[] = result.payload ?? [];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Products</h1>
      <ProductListings products={products} />
    </>
  );
}
