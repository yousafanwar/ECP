'use client';
import { useDispatch, useSelector } from "react-redux";
import { incrementCount } from '@/app/store/cartSlice';

interface AddToCartProps {
    product_id: number;
    className?: string;
    qty: number;
}

const AddToCartBtn = (props: AddToCartProps) => {

    const dispatch = useDispatch();
    const selector = useSelector((state: any) => state.cartStore.items);

    const addItem = async () => {
        if (!selector.includes(props.product_id)) {
            dispatch(incrementCount(props.product_id));
        };
        const obj = {
            user_id: "a92f0cb8-69ab-48e9-8d76-3bdc73a7e46c",
            product_id: props.product_id,
            quantity: props.qty
        };
        try {
            const response = await fetch(`http://localhost:5000/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(obj)
            })
            const result = await response.json();
            if (result?.payload?.cartId) {
                localStorage.setItem('cartId', result.payload.cartId);
            }
            if (!response.ok) {
                throw new Error("Could not update the cart");
            } else {
                alert(result.message);
            }
        } catch (err) {
            console.error("Error while updating the cart", err);
        }
    };

    return (
        <button onClick={addItem} className="cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-2 rounded-lg text-sm transition-colors">
            Add to Cart
        </button>
    )
};

export default AddToCartBtn;