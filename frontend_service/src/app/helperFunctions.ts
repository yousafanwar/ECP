import { CartCountResponse } from "@/app/interfaces";

export const updateCart = async (product_id: string, cart_item_id: string, opType: string, cart_id: string): Promise<CartCountResponse> => {
    try {
        const response = await fetch(`http://localhost:5000/cart/qty-update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id, cart_item_id, opType, cart_id })
        })
        const result = await response.json();
        if (!response.ok) {
            throw new Error('Quantity could not be updated');
        }
        return result;
    } catch (err) {
        throw err;
    }
};

// this functions restores cart items count in the redux store
export const restoreCartCount = async (cartId: string): Promise<CartCountResponse | void> => {
    try {
        // const cartId = localStorage.getItem('cartId')
        const response = await fetch(`http://localhost:5000/cart/cart-quantity/${cartId}`)
        const result = await response.json();
        console.log('restoreCartCount helper function', result);
        if (!response.ok) {
            throw new Error("Could not get cart qunatity");
        }
        return result.payload;
    } catch (err) {
        throw err
    }
};