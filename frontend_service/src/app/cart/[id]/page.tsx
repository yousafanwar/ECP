'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../cart.module.css";
import { useDispatch } from "react-redux";
import { resetCount, removeItem } from "@/app/store/cartSlice";
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
  const { user } = useAuth();

  useEffect(() => {
    const getCartItems = async () => {
      if (!cartId) return;
      try {
        const response = await apiGet(`/cart/${cartId}`);
        const result = await response.json();
        const totalPrice = result.payload.reduce(
          (acc: number, item: cartItemsArr) =>
            acc + item.price * item.quantity,
          0
        );
        setCartItems(result.payload);
        setPriceTotal(totalPrice);
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
    const response = await updateCart(product_id, cart_item_id, opType, cartId);


    // Update the local cartItems state
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cart_item_id === cart_item_id
          ? { ...item, quantity: response.payload.updatedItemQty }
          : item
      )
    );
    console.log('total price in cart: ', response.payload.CalCartPrice);

    setPriceTotal(response.payload.CalCartPrice);


  };

  const checkOut = async (): Promise<void> => {
    try {
      setError(null); // Clear previous errors
      
      if (!user?.userId || !cartId) {
        console.error('User ID or Cart ID not available');
        return;
      }

      const response = await apiPost(`/order/${user.userId}/${cartId}`, {});
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
        <div style={{
          backgroundColor: '#fee2e2',
          borderLeft: '4px solid #dc2626',
          color: '#991b1b',
          padding: '1rem',
          marginBottom: '1rem',
          borderRadius: '0.375rem',
          fontSize: '0.95rem'
        }}>
          <strong>Order Error:</strong> {error}
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
            <span>${priceTotal}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>$30</span>
          </div>
          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>${priceTotal + 30}</span>
          </div>
          <button className={styles.checkoutBtn} onClick={checkOut}>Proceed to Checkout</button>
          <button onClick={() => { router.push('/') }}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;