import { Body, Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

@Injectable()
export class ProductsService {

    constructor(private readonly pool: DbService) { };

    async addProduct(@Body() product: { name: string, price: number, sku: number, stock_quantity: number, description: string, category_id: number, brand_id: string, image_url: string, is_hero: boolean }) {
        const client = await this.pool.dbPool().connect();

        try {
            await client.query('BEGIN');
            const response = await client.query(`INSERT INTO public.products("name", price, sku, stock_quantity, description, category_id, brand_id)VALUES($1, $2, $3, $4, $5, $6, $7) returning product_id;`, [product.name, product.price, product.sku, product.stock_quantity, product.description, product.category_id, product.brand_id]);

            const product_id = response.rows[0].product_id

            const productImagesRes = await client.query(`INSERT INTO public.product_images(product_id, image_url, is_hero)VALUES($1, $2, $3) returning image_id;`, [product_id, product.image_url, true]);

            await client.query('COMMIT');

            return { productId: product_id, imageId: productImagesRes.rows[0].image_id };

        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error in addProduct:', err);
            throw err
        } finally {
            client.release();
        }
    };

    async getAllProducts() {
        try {
            const response = await this.pool.dbPool().query(`select products.product_id, products.name, products.price, products.sku, products.stock_quantity,products.description, products.category_id, products.brand_id, product_images.image_url, product_images.is_hero from public.products inner join public.product_images on public.products.product_id = public.product_images.product_id`);
            return response.rows;
        } catch (err) {
            console.error('Error while fetching products:', err);
            throw err;
        };
    }
}