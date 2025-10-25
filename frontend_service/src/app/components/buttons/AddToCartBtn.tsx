'use client';
import { useState, useEffect } from "react";

interface AddToCartProps {
    product_id: number;
}

const AddToCartBtn = (props: AddToCartProps) => {

    const [cartId, setCartId] = useState<number | null>(null);

    useEffect(() => {
        if (!cartId) return;
        const getCartItems = async () => {
            try {
                const response = await fetch(`http://localhost:5000/cart/${cartId}`);
                const result = await response.json();
                localStorage.setItem('cartItemsCount', result.payload.length);
            } catch (err) {
                console.error('Fetch failed:', err);
            }
        };
        getCartItems();
    }, [cartId]);

    const addItem = async () => {

        const obj = {
            user_id: "a92f0cb8-69ab-48e9-8d76-3bdc73a7e46c",
            product_id: props.product_id,
            quantity: 1
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
                setCartId(result.payload.cartId);
                localStorage.setItem('cartId', result.payload.cartId);
            }
            console.log('add to cart result: ', result);
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