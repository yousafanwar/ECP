'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../cart.module.css";
import { useDispatch } from "react-redux";
import { decrementCount, resetCount, removeItem } from "@/app/store/cartSlice";

interface cartItemsArr {
  cart_item_id: string;
  name: string;
  price: number;
  product_id: string;
  quantity: number;
  image_url: string;
}

const Cart = () => {

  const [cartItems, setCartItems] = useState<cartItemsArr[]>([]);
  const [priceTotal, setPriceTotal] = useState<number>(0);
  const [refreshCart, setRefreshCart] = useState<boolean>(false);
  const [cartId, setCartId] = useState<string | null>("");
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem('cartId')) {
      const storedCartId = localStorage.getItem('cartId');
      setCartId(storedCartId);
    }
  }, [])

  useEffect(() => {
    const getCartItems = async () => {
      try {
        const response = await fetch(`http://localhost:5000/cart/${cartId}`);
        const result = await response.json();
        let totalPrice = result.payload.map((item: cartItemsArr) => {
          return item.price;
        }).reduce((acc: number, ele: any) => acc + ele, 0);
        setCartItems(result.payload);
        setPriceTotal(totalPrice);
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    };
    getCartItems();
  }, [refreshCart, cartId]);

  const updateCart = async (item: number, product_id: string) => {

    const obj = {
      user_id: "90759e0a-654a-4f75-ba11-1a8d31973a39",
      product_id: product_id,
      quantity: item
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
      if (!response.ok) {
        throw new Error("Could not update the cart");
      } else {
        setRefreshCart(!refreshCart);
      }
    } catch (err) {
      console.error("Error while updating the cart", err);
    }
  };

  const removeCartItem = async (cartItemId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/cart/delete_item/${cartItemId}`, {
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
        dispatch(decrementCount());
        setRefreshCart(!refreshCart);
        dispatch(removeItem(cartItemId));
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
                  <button onClick={() => { updateCart(item.quantity - 1, item.product_id) }} className={styles.qtyBtn}>-</button>
                  <span className={styles.qtyCount}>{item.quantity}</span>
                  <button onClick={() => { updateCart(item.quantity + 1, item.product_id) }} className={styles.qtyBtn}>+</button>
                </div>
                <button onClick={() => { removeCartItem(item.cart_item_id) }} className={styles.removeBtn}>Remove</button>
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
        </div>
      </div>
    </div>
  );
}

export default Cart;