'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../cart.module.css";
import { useDispatch } from "react-redux";
import { resetCount, removeItem } from "@/app/store/cartSlice";
import { cartItemsArr } from "@/app/interfaces";
import { updateCart } from "@/app/helperFunctions";

const Cart = () => {

  const [cartItems, setCartItems] = useState<cartItemsArr[]>([]);
  const [priceTotal, setPriceTotal] = useState<number>(0);
  const [refreshCart, setRefreshCart] = useState<boolean>(false);
  const [cartId, setCartId] = useState<string>("");
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('cartId')) {
      const storedCartId = localStorage.getItem('cartId');
      setCartId(storedCartId!);
    }
  }, [])

  useEffect(() => {
    const getCartItems = async () => {
      if (!cartId) return;
      try {
        const response = await fetch(`http://localhost:5000/cart/${cartId}`);
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
      const response = await fetch(`http://localhost:5000/cart/delete_item/${cartItem.cart_item_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
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
      const response = await fetch(`http://localhost:5000/cart/delete_cart/${cartId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
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

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>Your Shopping Cart</h1>

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
          <button className={styles.checkoutBtn}>Proceed to Checkout</button>
          <button onClick={() => { router.push('/') }}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;