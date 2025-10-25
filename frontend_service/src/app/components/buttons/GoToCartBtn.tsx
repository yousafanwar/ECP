'use client'
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const GoToCartBtn = () => {

    const [cartExists, setCartExists] = useState<boolean>(false);
    const [cartId, setCartId] = useState<number>(0);
    const [cartCount, setCartCount] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        if (localStorage.getItem('cartId')) {
            const storedCartId = localStorage.getItem('cartId');
            setCartId(storedCartId ? parseInt(storedCartId) : 0);
            setCartExists(true);
        };

        if (localStorage.getItem('cartItemsCount')) {
            const storedCount = localStorage.getItem('cartItemsCount');
            const count = storedCount ? parseInt(storedCount) : 0;
            if (count > 0) { setCartExists(true); };
            setCartCount(storedCount ? parseInt(storedCount) : 0);
        }
    }, [])

    return (
        <>
            <button disabled={!cartExists} className="relative cursor-pointer" onClick={() => router.push(`/cart/${cartId}`)}>
                <ShoppingCartIcon className="h-8 w-8 text-gray-800 hover:text-gray-600" />

                {cartCount > 0 && (
                    <span className="
          absolute -top-1 -right-1 
          bg-red-600 text-white 
          text-xs font-bold 
          px-1.5 py-0.5 
          rounded-full
        ">
                        {cartCount}
                    </span>
                )}
            </button>

        </>
    )
}

export default GoToCartBtn;