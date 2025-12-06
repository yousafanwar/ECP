'use client';
import AddToCartBtn from "./buttons/AddToCartBtn";
import BuyNowBtn from "./buttons/BuyNow";
import { useRouter } from "next/navigation";

const ProductCard = (props: any) => {
    const router = useRouter();

    return (
        <div key={props.product.product_id} className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
            <div onClick={() => { router.push(`/product/${props.product.product_id}`) }}>
                <img
                    src={props.product.image_url}
                    alt="Product image"
                    className="w-full h-56 object-cover"
                />

                <div className="p-5">
                    <h2 className="text-lg font-bold capitalize mb-2">{props.product.name}</h2>
                    <p className="text-gray-400 mb-4">{props.product.description}</p>
                </div>

            </div>
            <div className="flex justify-between items-center gap-2 p-4">
                <span className="text-xl font-semibold">${props.product.price}</span>
                <AddToCartBtn product_id={props.product.product_id} qty={1} />
                <BuyNowBtn />
            </div>
        </div>
    )
};

export default ProductCard;