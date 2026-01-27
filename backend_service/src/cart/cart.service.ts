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

      const validateStock = await client.query(`SELECT stock_quantity FROM products WHERE product_id = $1 FOR UPDATE;`, [cart.product_id]);
      const inStockQty = validateStock.rows[0].stock_quantity;

      if (cart.quantity > inStockQty) {
        throw new Error('Out of stock');
      }

      // Check if cart already exists
      const cartRes = await client.query(`SELECT cart_id FROM cart WHERE user_id = $1;`, [cart.user_id]);

      if (cartRes.rowCount > 0) {
        cartId = cartRes.rows[0].cart_id;

        // Check if item already exists
        const itemRes = await client.query(`SELECT cart_item_id FROM cart_items WHERE product_id = $1 AND cart_id = $2;`, [cart.product_id, cartId]);

        if (itemRes.rowCount > 0) {
          const cart_item_id = itemRes.rows[0].cart_item_id;

          await client.query(`UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2 AND cart_id = $3;`, [cart.quantity, cart_item_id, cartId]);

          await client.query('COMMIT');
          return { message: 'Item already exists in cart, quantity updated successfully', payload: { cartId, cart_item_id } };
        } else {
          const insertRes = await client.query(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING cart_item_id;`, [cartId, cart.product_id, cart.quantity]);

          await client.query('COMMIT');
          return { message: 'Item added to existing cart', payload: { cartId, cart_item_id: insertRes.rows[0] } };
        }

      } else {
        // Create new cart and item
        const cartRes = await client.query(`INSERT INTO cart (user_id) VALUES ($1) RETURNING cart_id;`, [cart.user_id]);
        cartId = cartRes.rows[0].cart_id;

        const itemRes = await client.query(`INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING cart_item_id;`, [cartId, cart.product_id, cart.quantity]);

        await client.query('COMMIT');
        return { message: 'Cart created and item added', payload: { cartId, cart_item_id: itemRes.rows[0].cart_item_id } };
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
      const cartItemsRes = await this.dbService.dbPool().query(`select cart_items.cart_item_id, cart_items.product_id, cart_items.quantity, products.name, products.price , product_images.image_url, product_images.is_hero from cart inner join cart_items on cart.cart_id = cart_items.cart_id inner join products on products.product_id = cart_items.product_id inner join product_images on product_images.product_id = products.product_id and cart.cart_id = $1;`, [cart_id]);
      const result = cartItemsRes.rows.map((item) => {
        return {
          cart_item_id: item.cart_item_id,
          product_id: item.product_id,
          quantity: item.quantity,
          name: item.name,
          price: item.price * item.quantity,
          image_url: item.image_url
        }
      });
      return result;
    } catch (err) {
      console.error('Error while retrieving the cart items', err);
      throw err;
    }

  }

  async removeCart(cart_id) {
    try {
      const response = await this.dbService.dbPool().query(`DELETE FROM public.cart WHERE cart_id=$1;`, [cart_id]);
      return response.rows;
    } catch (err) {
      console.error('Error while deleting the cart items', err);
      throw err;
    }
  };

  async removeCartItem(cart_item_id) {
    try {
      const response = await this.dbService.dbPool().query(`DELETE FROM public.cart_items WHERE cart_item_id=$1;`, [cart_item_id]);
      return response.rows;
    } catch (err) {
      console.error('Error while deleting the cart items', err);
      throw err;
    }
  }

  async getUserCart(user_id) {
    try {
      const cartRes = await this.dbService.dbPool().query(`SELECT cart_id FROM public.cart where user_id = $1;`, [user_id]);
      return cartRes.rows[0];
    } catch (err) {
      console.error('Error while retrieving the cart', err);
      throw err;
    }
  }

  async fetchProductStock(product_id) {
    const client = await this.dbService.dbPool();
    try {
      const stockQty = await client.query(`SELECT stock_quantity FROM public.products where product_id=$1 FOR UPDATE;`, [product_id]);
      return stockQty.rows[0].stock_quantity;
    } catch (err) {
      throw err;
    }
  }

  async updateCartItemQty(body) {
    const client = await this.dbService.dbPool().connect()
    let updatedItemQty = 0;
    console.log('body', body);
    try {
      await client.query('BEGIN');
      const stockQty = await client.query(`SELECT stock_quantity FROM public.products where product_id=$1 FOR UPDATE;`, [body.product_id]);
      const availableStock = stockQty.rows[0].stock_quantity;

      const cartQTY = await client.query(`SELECT quantity FROM public.cart_items where cart_item_id = $1 FOR UPDATE;`, [body.cart_item_id]);
      const cartItemQty = cartQTY.rows[0].quantity;

      if (body.opType === 'increment' && cartItemQty >= availableStock) { throw 'Out of stock' };

      if (body.opType === 'decrement' && cartItemQty <= 1) {
        throw 'Minimum quantity reached';
      }

      if (body.opType === 'increment') {
        console.log('increment block hit');
        let response = await client.query(`UPDATE public.cart_items SET quantity=quantity+1 
          WHERE cart_item_id=$1 returning quantity;`, [body.cart_item_id]);
        updatedItemQty = response.rows[0].quantity;
        console.log('increment response', response);
      }

      if (body.opType === 'decrement' && cartItemQty > 1) {
        console.log('decrement block hit');
        let response = await client.query(`UPDATE public.cart_items
          SET quantity=quantity-1
          WHERE cart_item_id=$1 returning quantity;`, [body.cart_item_id]);
        updatedItemQty = response.rows[0].quantity;
        console.log('increment response', response);
      }
      const cartQty = await client.query('select quantity from cart_items where cart_id=$1;', [body.cart_id]);
      const totalCartQty = cartQty.rows.reduce((acc, item) => acc += item.quantity, 0);
      const CalCartPrice = await this.calculateCartTotalPrice(body.cart_id);
      console.log('CalCartPrice', CalCartPrice)

      await client.query('COMMIT');
      return { totalCartQty, updatedItemQty, CalCartPrice };

    } catch (err) {
      console.log('this is the error', err);
      await client.query('ROLLBACK');
      throw err
    } finally {
      client.release();
    }
  }

  async fetchCartItemsQuantity(cart_id) {
    try {
      const client = await this.dbService.dbPool();
      const cartQty = await client.query('select quantity from cart_items where cart_id=$1;', [cart_id]);
      const totalCartQty = cartQty.rows.reduce((acc, item) => acc += item.quantity, 0);
      return totalCartQty;
    } catch (err) {
      throw err;
    }
  }

  async fetchIndCartQty(product_id, cart_id) {
    try {
      const client = await this.dbService.dbPool();
      const item = await client.query(`select quantity from cart_items where cart_id=$1 and product_id=$2;`, [product_id, cart_id]);
      const item_quantity = item.rows[0].quantity;
      return item_quantity;
    } catch (err) {
      throw new Error(`Failed to fetch cart item quantity: ${err}`);
    }
  }

  async calculateCartTotalPrice(cart_id) {
    try {
      const client = await this.dbService.dbPool();
      const res = await client.query(`SELECT SUM(ci.quantity * p.price) AS total
                                          FROM cart_items ci
                                          JOIN products p ON p.product_id = ci.product_id
                                          WHERE ci.cart_id = $1;`, [cart_id]);
      console.log('res.rows[0]', res.rows[0])
      return Number(res.rows[0].total);
    } catch (err) {
      throw new Error(err);
    }
  }
};