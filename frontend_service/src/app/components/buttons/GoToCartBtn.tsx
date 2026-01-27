'use client';
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

const GoToCartBtn = () => {

    const [cartId, setCartId] = useState<string>("");
    const [cartCount, setCartCount] = useState<number>(0);
    const router = useRouter();
    // const [cartExists, setCartExists] = useState<boolean>(false);
    const selector = useSelector((state: any) => state.cartStore.count);
    const dispatch = useDispatch();

    useEffect(() => {
        const getCart = async () => {
                let cartResponse = await fetch(`http://localhost:5000/cart/user/90759e0a-654a-4f75-ba11-1a8d31973a39`);
                let result = await cartResponse.json();
                if (!result.ok) {
                    return;
                } else {
                    setCartId(result?.payload?.cart_id);
                }
        };

        if (localStorage.getItem('cartId')) {
            setCartId(localStorage.getItem('cartId')!);
        } else {
            getCart();
        }
    }, []);

    useEffect(() => {
        const getStoreCount = async () => {
            const storeSelector = await selector;
            setCartCount(storeSelector);
        }

        getStoreCount();
    }, [selector])

    const navigateToCart = () => {
        const cartIdfromStorage = localStorage.getItem('cartId');
        if (cartIdfromStorage) {
            router.push(`/cart/${cartIdfromStorage}`);
        } else {
            return;
        }
    };

    return (
        <>
            <button className="relative cursor-pointer" onClick={navigateToCart}>
                <ShoppingCartIcon className="h-8 w-8 text-gray-800 hover:text-gray-600" />
                <span className="
          absolute -top-1 -right-1 
          bg-red-600 text-white 
          text-xs font-bold 
          px-1.5 py-0.5 
          rounded-full
        ">
                    {cartCount}
                </span>
            </button>

        </>
    )
}

export default GoToCartBtn;