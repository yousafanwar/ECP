'use client';
import { useDispatch, useSelector } from "react-redux";
import { addItem, updateCount } from '@/app/store/cartSlice';
import { restoreCartCount } from '@/app/helperFunctions';
import { apiPost } from "@/lib/api";
import { RootState } from "@/app/store/store";
import { useRouter } from "next/navigation";

interface AddToCartProps {
    product_id: string;
    className?: string;
    qty: number;
}

const AddToCartBtn = (props: AddToCartProps) => {

    const dispatch = useDispatch();
    const router = useRouter();
    const selector = useSelector((state: any) => state.cartStore.items);
    const userId = useSelector((state: RootState) => state.auth.user?.userId);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const getCartCount = async (cartId: string) => {
        const cartCount = await restoreCartCount(cartId);
        dispatch(updateCount(cartCount ?? 0));
    }

    const addItemToCart = async () => {
        // Check if user is authenticated
        if (!isAuthenticated || !userId) {
            alert("Please login to add items to cart");
            router.push('/login');
            return;
        }

        if (!selector.includes(props.product_id)) {
            dispatch(addItem(props.product_id));
        };
        
        try {
            const response = await apiPost('/cart', {
                user_id: userId,
                product_id: props.product_id,
                quantity: props.qty
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error("Could not update the cart");
            }
            
            getCartCount(result.payload.cartId);
            if (result?.payload?.cartId) {
                localStorage.setItem('cartId', result.payload.cartId);
            }
            alert(result.message);
        } catch (err) {
            console.error("Error while updating the cart", err);
        }
    };

    return (
        <button onClick={addItemToCart} className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors">
            Add to Cart
        </button>
    )
};

export default AddToCartBtn;