import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

@Injectable()
export class CartService {
  constructor(private readonly dbService: DbService) { };

  async addToCart(cart) {
    const client = await this.dbService.dbPool().connect();
    let cartId = null;

    try {
      await client.query('BEGIN');

      // Check if cart already exists
      const cartRes = await client.query(`SELECT cart_id FROM cart WHERE user_id = $1;`, [cart.user_id]);

      if (cartRes.rowCount > 0) {
        cartId = cartRes.rows[0].cart_id;

        // Check if item already exists
        const itemRes = await client.query(`SELECT cart_item_id FROM cart_items WHERE product_id = $1 AND cart_id = $2;`, [cart.product_id, cartId]);

        if (itemRes.rowCount > 0) {
          const cart_item_id = itemRes.rows[0].cart_item_id;

          await client.query(`UPDATE cart_items SET quantity = quantity + $1 WHERE cart_item_id = $2 AND cart_id = $3;`, [cart.quantity, cart_item_id, cartId]);

          await client.query('COMMIT');
          return { message: 'Item already exists in cart, quantity updated successfully' };
        } else {
          const insertRes = await client.query(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING cart_item_id;`, [cartId, cart.product_id, cart.quantity]);

          await client.query('COMMIT');
          return { message: 'Item added to existing cart', payload: insertRes.rows[0] };
        }

      } else {
        // Create new cart and item
        const cartRes = await client.query(`INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id;`, [cart.user_id]);
        cartId = cartRes.rows[0].cart_id;

        const itemRes = await client.query(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING cart_item_id;`, [cartId, cart.product_id, cart.quantity]);

        await client.query('COMMIT');
        return { message: 'Cart created and item added', payload: { cartId, cartItemId: itemRes.rows[0].cart_item_id } };
      }
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error adding to cart:', err);
      return { message: 'Database error', error: err.message };
    } finally {
      client.release();
    }
  }

  async getCartItems(cart_id) {
    try {
      const cartItemsRes = await this.dbService.dbPool().query(`select cart_items.cart_item_id, cart_items.product_id, cart_items.quantity, products.name, products.price from cart inner join cart_items on cart.cart_id = cart_items.cart_id inner join products on products.product_id = cart_items.product_id and cart.cart_id = $1;`, [cart_id]);
      return cartItemsRes.rows;
    } catch (err) {
      console.error('Error while retrieving the cart items', err);
      throw err;
    }

  }
};