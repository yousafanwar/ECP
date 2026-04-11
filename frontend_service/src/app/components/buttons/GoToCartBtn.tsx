'use client';
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@/lib/hooks/useAuth";
import { apiGet } from "@/lib/api";
import { updateCount } from "@/app/store/cartSlice";

const GoToCartBtn = () => {
    const [cartId, setCartId] = useState<string>("");
    const [cartCount, setCartCount] = useState<number>(0);
    const router = useRouter();
    const selector = useSelector((state: any) => state.cartStore.count);
    const dispatch = useDispatch();
    const { user, isGuest, guestId } = useAuth();

    // Resolve the effective user ID — registered user or guest
    const effectiveUserId = user?.userId ?? (isGuest ? guestId : null);

    useEffect(() => {
        const getCart = async () => {
            if (!effectiveUserId) return;

            try {
                const result = await apiGet(`/cart/user/${effectiveUserId}`);
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
        } else if (effectiveUserId) {
            getCart();
        }
    }, [effectiveUserId]);

    useEffect(() => {
        const getStoreCount = async () => {
            const storeSelector = await selector;
            setCartCount(storeSelector);
        }

        getStoreCount();
    }, [selector]);

    // Rehydrate Redux from localStorage only when count is 0 on mount (e.g. page refresh)
    useEffect(() => {
        if (selector === 0) {
            const savedCount = localStorage.getItem('cartCount');
            if (savedCount) {
                dispatch(updateCount(parseInt(savedCount, 10)));
            }
        }
    }, []);

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
                <ShoppingCartIcon className="h-8 w-8 text-gray-700 hover:text-indigo-600" />
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