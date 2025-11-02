'use client';
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const GoToCartBtn = () => {

    const [cartId, setCartId] = useState<number>(0);
    const [cartCount, setCartCount] = useState<number>(0);
    const router = useRouter();
    // const [cartExists, setCartExists] = useState<boolean>(false);
    const selector = useSelector((state: any) => state.cartStore.count);

    useEffect(() => {
        let parsedCount = Number(localStorage.getItem('cartItemsCount')) || 0;
        let reducerCartCount = selector !== 0 ? Math.max(parsedCount, selector) : (parsedCount + selector);
        setCartCount(reducerCartCount);
    }, [selector])

    useEffect(() => {
        if (localStorage.getItem('cartId')) {
            const storedCartId = localStorage.getItem('cartId');
            const parsedId = storedCartId ? parseInt(storedCartId) : 0;
            setCartId(parsedId);
            // setCartExists(true);
        }
    }, [])

    useEffect(() => {
        if (!cartId) return;
        const getCartItems = async () => {
            try {
                const response = await fetch(`http://localhost:5000/cart/${cartId}`);
                const result = await response.json();
                setCartCount(result.payload.length);
                localStorage.removeItem('cartItemsCount');
                localStorage.setItem('cartItemsCount', result.payload.length);
                // setCartExists(true);
            } catch (err) {
                console.error('Unable to fetch cart items:', err);
            }
        };
        getCartItems();
    }, [cartId, selector]);

    const navigateToCart = () => {
        const storesCartId = localStorage.getItem('cartId');
        if (storesCartId) {
            router.push(`/cart/${parseInt(storesCartId)}`);
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