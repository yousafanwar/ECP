import AddProductBtn from "./components/buttons/AddProductBtn";
import FilterBtn from "./components/buttons/FilterBtn";
import SortBtn from "./components/buttons/SortBtn";
import AddToCartBtn from "./components/buttons/AddToCartBtn";
import BuyNowBtn from "./components/buttons/BuyNow";

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
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        {result.payload && result.payload.map((ele: any) => {
          return (
            <div key={ele.product_id} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
              <img
                src={ele.image_url}
                alt="Product image"
                className="w-full h-56 object-cover"
              />

              <div className="p-5">
                <h2 className="text-lg font-bold capitalize mb-2">{ele.name}</h2>
                <p className="text-gray-400 mb-4">{ele.description}</p>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-xl font-semibold">${ele.price}</span>
                  <AddToCartBtn />
                  <BuyNowBtn />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
