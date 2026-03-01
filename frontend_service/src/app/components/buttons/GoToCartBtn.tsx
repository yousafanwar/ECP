'use client';
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiGet } from "@/lib/api";

const GoToCartBtn = () => {
    const [cartId, setCartId] = useState<string>("");
    const [cartCount, setCartCount] = useState<number>(0);
    const router = useRouter();
    const selector = useSelector((state: any) => state.cartStore.count);
    const { user } = useAuth();

    useEffect(() => {
        const getCart = async () => {
            // Only fetch if user is available
            if (!user?.userId) {
                console.log('Waiting for user to load...');
                return;
            }

            try {
                const result = await apiGet(`/cart/user/${user.userId}`);
                if (result?.ok) {
                    const data = await result.json();
                    if (data?.payload?.cart_id) {
                        setCartId(data.payload.cart_id);
                        localStorage.setItem('cartId', data.payload.cart_id);
                    }
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        };

        // Check localStorage first
        const cartFromStorage = localStorage.getItem('cartId');
        if (cartFromStorage) {
            setCartId(cartFromStorage);
        } else if (user?.userId) {
            // Only fetch if user is available
            getCart();
        }
    }, [user?.userId]); // Re-run when userId changes

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