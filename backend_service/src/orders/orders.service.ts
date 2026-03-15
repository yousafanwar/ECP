import { Injectable, NotFoundException } from "@nestjs/common";
import { DbService } from "src/db/db.service";

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

            const address_id = addressRes.rows && addressRes.rows.length > 0 
                ? addressRes.rows[0].address_id 
                : null;
            

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

    };

    async getOrderByOrderId(order_id) {
        try {
            const orderAddressRes = await this.pool.dbPool().query(`select address.street, address.city, address.state, address.country, address."type"   
                from address inner join orders on address.address_id = orders.address_id
                where orders.order_id = $1;`, [order_id]);

            const orderAddress = orderAddressRes.rows[0];
            console.log('orderItemsRes', orderAddressRes.rows[0]);

            const orderItemsRes = await this.pool.dbPool().query(`select order_items.order_item_id, order_items.quantity, products.name, products.price , product_images.image_url, product_images.is_hero 
            from orders inner join order_items on orders.order_id = order_items.order_id 
            inner join products on products.product_id = order_items.product_id 
            inner join product_images 
            on product_images.product_id = products.product_id and orders.order_id = $1;`, [order_id]);

            const orderItems = orderItemsRes.rows.map((item) => {
                return {
                    quantity: item.quantity,
                    name: item.name,
                    price: item.price * item.quantity,
                    isHeroImage: item.is_hero,
                    image_url: item.image_url
                }
            });
            return { orderAddress, orderItems };
        } catch (err) {
            console.error('Error while retrieving the order items', err);
            throw err;
        }
    }

    async confirmCODOrder(order_id: string): Promise<void> {
        const client = await this.pool.dbPool().connect();
        try {
            await client.query('BEGIN');

            const totalRes = await client.query(
                `SELECT COALESCE(SUM(price * quantity), 0) AS total FROM order_items WHERE order_id = $1`,
                [order_id]
            );
            const total = totalRes.rows[0]?.total ?? 0;

            await client.query(
                `UPDATE orders SET status = 'confirmed' WHERE order_id = $1`,
                [order_id]
            );

            await client.query(
                `INSERT INTO payments (order_id, payment_type, amount, status) VALUES ($1, 'COD', $2, 'pending')`,
                [order_id, total]
            );

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error confirming COD order:', err);
            throw err;
        } finally {
            client.release();
        }
    }

    async deleteOrder(orderId: string) {
        const client = await this.pool.dbPool().connect();
        try {
            await client.query('BEGIN');

            // Restore stock quantities before deleting order items
            await client.query(
                `UPDATE products p
                 SET stock_quantity = stock_quantity + oi.quantity
                 FROM order_items oi
                 WHERE oi.order_id = $1 AND p.product_id = oi.product_id`,
                [orderId]
            );

            await client.query(`DELETE FROM public.order_items WHERE order_id=$1;`, [orderId]);
            const orderRes = await client.query(`DELETE FROM public.orders WHERE order_id=$1;`, [orderId]);
            if (orderRes.rowCount === 0) {
                throw new NotFoundException('Order not found');
            }
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw new Error(`Failed to delete order: ${err.message}`);
        } finally {
            client.release();
        }
    }
}