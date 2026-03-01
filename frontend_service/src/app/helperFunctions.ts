import { CartCountResponse } from "@/app/interfaces";
import { apiPut, apiGet } from "@/lib/api";

export const updateCart = async (product_id: string, cart_item_id: string, opType: string, cart_id: string): Promise<CartCountResponse> => {
    try {
        const response = await apiPut('/cart/qty-update', {
            product_id,
            cart_item_id,
            opType,
            cart_id
        });
        
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
        const response = await apiGet(`/cart/cart-quantity/${cartId}`);
        const result = await response.json();
        console.log('restoreCartCount helper function', result);
        if (!response.ok) {
            throw new Error("Could not get cart quantity");
        }
        return result.payload;
    } catch (err) {
        throw err
    }
};