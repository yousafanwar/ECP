import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { OrderItems } from "./interface";

@Injectable()
export class OrdersService {
    constructor(private readonly pool: DbService) { }

    async createOrder(user_id, cart_id): Promise<string> {
        const client = await this.pool.dbPool().connect();
        let orderId;

        try {
            await client.query('BEGIN');

            const cartItemsRes = await client.query(
                `SELECT product_id, quantity
     FROM cart_items
     WHERE cart_id = $1;`,
                [cart_id]
            );

            if (cartItemsRes.rowCount === 0) {
                throw new Error('CART_EMPTY');
            }

            const cartItems = cartItemsRes.rows;
            const productIds = cartItems.map(item => item.product_id);

            const productsRes = await client.query(
                `SELECT product_id, stock_quantity, price
     FROM products
     WHERE product_id = ANY($1)
     FOR UPDATE;`,
                [productIds]
            );

            for (const item of cartItems) {
                const product = productsRes.rows.find(
                    p => p.product_id === item.product_id
                );

                if (!product || product.stock_quantity < item.quantity) {
                    throw new Error(`INSUFFICIENT_STOCK_${item.product_id}`);
                }
            }

            const addressRes = await client.query(`SELECT address_id
    FROM public.address where user_id = $1 
    and type in ('both', 'shipping');`, [user_id]);

            const address_id = addressRes.rows[0].address_id;

            await client.query(
                `UPDATE products
     SET stock_quantity = stock_quantity - ci.quantity
     FROM cart_items ci
     WHERE products.product_id = ci.product_id
     AND ci.cart_id = $1;`,
                [cart_id]
            );

            const orderRes = await client.query(
                `INSERT INTO orders (
        user_id,
        status,
        address_id
     )
     VALUES ($1, $2, $3)
     RETURNING order_id;`,
                [user_id, 'pending', address_id]
            );

            orderId = orderRes.rows[0].order_id;

            await client.query(
                `INSERT INTO order_items (
        order_id,
        product_id,
        price,
        quantity
     )
     SELECT
       $1,
       p.product_id,
       p.price,
       ci.quantity
     FROM cart_items ci
     JOIN products p ON p.product_id = ci.product_id
     WHERE ci.cart_id = $2;`,
                [orderId, cart_id]
            );

            await client.query('COMMIT');

            return orderId;

        } catch (err) {
            await client.query('ROLLBACK');

            console.error('Error creating order:', err);
            throw err;

        } finally {
            client.release();
        }

    }
}