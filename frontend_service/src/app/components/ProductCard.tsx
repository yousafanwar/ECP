'use client';
import AddToCartBtn from "./buttons/AddToCartBtn";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatPrice";

const ProductCard = (props: any) => {
    const router = useRouter();

    return (
        <div key={props.product.product_id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-200 hover:-translate-y-1">
            <div className="relative cursor-pointer overflow-hidden" onClick={() => { router.push(`/product/${props.product.product_id}`) }}>
                <img
                    src={props.product.image_url}
                    alt="Product image"
                    className="w-full h-64 object-contain transition-transform duration-500 group-hover:scale-105"
                />
                {props.product.stock_quantity <= 3 && props.product.stock_quantity > 0 && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Low Stock</span>
                )}
                {props.product.stock_quantity <= 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Sold Out</span>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    {props.product.category_title && (
                        <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{props.product.category_title}</span>
                    )}
                    {props.product.brand_title && (
                        <span className="text-[11px] font-medium text-gray-500">{props.product.brand_title}</span>
                    )}
                </div>
                <h2
                    className="text-sm font-semibold text-gray-900 capitalize mb-1 cursor-pointer hover:text-indigo-600 transition-colors line-clamp-1"
                    onClick={() => { router.push(`/product/${props.product.product_id}`) }}
                >
                    {props.product.name}
                </h2>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{props.product.description}</p>
                <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                    <span className="text-lg font-bold text-gray-900">{formatPrice(props.product.price)}</span>
                    <AddToCartBtn product_id={props.product.product_id} qty={1} />
                </div>
            </div>
        </div>
    )
};

export default ProductCard;