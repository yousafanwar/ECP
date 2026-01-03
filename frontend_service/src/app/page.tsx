import AddProductBtn from "./components/buttons/AddProductBtn";
import FilterBtn from "./components/buttons/FilterBtn";
import SortBtn from "./components/buttons/SortBtn";
import GoToCartBtn from "./components/buttons/GoToCartBtn";
import ProductCard from "./components/ProductCard";

export default async function Home() {
  const response = await fetch(`http://localhost:5000/product`);
  const result = await response.json();

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-2">
        <div className="flex gap-3">
          <AddProductBtn />
          <FilterBtn />
          <SortBtn />
          <GoToCartBtn />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        {result && result.map((ele: any) => {
          return (
            <ProductCard product={ele} key={ele.product_id} />
          )
        })}
      </div>
    </>
  )
}
