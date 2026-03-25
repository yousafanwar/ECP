'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../cart.module.css";
import { useDispatch } from "react-redux";
import { resetCount, removeItem, updateCount } from "@/app/store/cartSlice";
import { cartItemsArr } from "@/app/interfaces";
import { updateCart } from "@/app/helperFunctions";
import { useParams } from "next/navigation";
import { apiGet, apiDelete, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/hooks/useAuth";

const Cart = () => {

  const [cartItems, setCartItems] = useState<cartItemsArr[]>([]);
  const [priceTotal, setPriceTotal] = useState<number>(0);
  const [refreshCart, setRefreshCart] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const cartId = params.id as string;
  const { user, isGuest, guestId } = useAuth();
  const currentUserId = user?.userId || guestId;

  const isValidUUID = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

  useEffect(() => {
    const getCartItems = async () => {
      if (!cartId) return;

      if (!isValidUUID(cartId)) {
        localStorage.removeItem('cartId');
        dispatch(resetCount());
        router.replace('/');
        return;
      }

      try {
        const response = await apiGet(`/cart/${cartId}`);
        const result = await response.json();
        const totalPrice = result.payload.reduce(
          (acc: number, item: cartItemsArr) =>
            acc + Number(item.price) * item.quantity,
          0
        );
        setCartItems(result.payload);
        setPriceTotal(parseFloat(totalPrice.toFixed(2)));
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    };
    getCartItems();
  }, [refreshCart, cartId]);

  const removeCartItem = async (cartItem: any) => {
    try {
      const response = await apiDelete(`/cart/delete_item/${cartItem.cart_item_id}`);
      const result = await response.json();
      result.success && alert('Item removed from cart');
      if (!response.ok) {
        throw new Error("Could not delete the cart item");
      } else {
        setRefreshCart(!refreshCart);
        dispatch(removeItem(cartItem.cart_item_id));
      }
      if (cartItems.length === 1) {
        await removeCart(cartId);
        localStorage.removeItem('cartId');
        dispatch(resetCount());
        router.push('/');
      }
    } catch (err) {
      console.error("Error while deleting the item from the cart", err);
    }
  };

  const removeCart = async (cartId: string | null) => {
    try {
      const response = await apiDelete(`/cart/delete_cart/${cartId}`);
      if (!response.ok) {
        throw new Error("Could not delete the cart");
      } else {
        setRefreshCart(!refreshCart);
        localStorage.removeItem('cartItemsCount');
      }
    } catch (err) {
      console.error("Error while deleting the cart", err);
    }
  };

  const updateCartCount = async (product_id: string, cart_item_id: string, opType: string) => {
    try {
      const response = await updateCart(product_id, cart_item_id, opType, cartId);

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.cart_item_id === cart_item_id
            ? { ...item, quantity: response.payload.updatedItemQty }
            : item
        )
      );

      dispatch(updateCount(response.payload.totalCartQty));
      setPriceTotal(parseFloat(Number(response.payload.CalCartPrice).toFixed(2)));
    } catch (err: any) {
      console.error('Could not update cart quantity:', err.message ?? err);
    }
  };

  const checkOut = async (): Promise<void> => {
    try {
      setError(null); // Clear previous errors
      
      if (!currentUserId || !cartId) {
        console.error('User ID or Cart ID not available');
        return;
      }

      const response = await apiPost(`/order/${currentUserId}/${cartId}`, {});
      const result = await response.json();
      
      if (!response.ok) {
        // Handle specific error messages from backend
        const errorMessage = result.message || 'Failed to create order';
        setError(errorMessage);
        console.error(errorMessage);
        return;
      }
      
      const orderId = result.payload;
      router.push(`/order/${orderId}`);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while processing your order';
      setError(errorMessage);
      console.error(errorMessage);
    }
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>Your Shopping Cart</h1>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span><strong>Order Error:</strong> {error}</span>
        </div>
      )}

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {cartItems.map((item: cartItemsArr) => (
            <div className={styles.cartItem} key={item.cart_item_id}>
              <img
                src={item.image_url}
                alt={item.name}
                className={styles.cartItemImage}
              />
              <div className={styles.cartItemDetails}>
                <h2 className={styles.cartItemName}>{item.name}</h2>
                <p className={styles.cartItemPrice}>${item.price}</p>
                <div className={styles.cartItemQuantity}>
                  <button onClick={() => { updateCartCount(item.product_id, item.cart_item_id, 'decrement') }} className={styles.qtyBtn}>-</button>
                  <span className={styles.qtyCount}>{item.quantity}</span>
                  <button onClick={() => { updateCartCount(item.product_id, item.cart_item_id, 'increment') }} className={styles.qtyBtn}>+</button>
                </div>
                <button onClick={() => { removeCartItem(item) }} className={styles.removeBtn}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <h3>Order Summary</h3>
          <div className={styles.summaryRow}>
            <span>Price Total</span>
            <span>${priceTotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>$30.00</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>${(priceTotal + 30).toFixed(2)}</span>
          </div>
          <button className={styles.checkoutBtn} onClick={checkOut}>Proceed to Checkout</button>
          <button onClick={() => { router.push('/') }} className="w-full cursor-pointer bg-white border-1.5 border-gray-200 text-gray-700 py-3 rounded-lg mt-3 font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors">Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;