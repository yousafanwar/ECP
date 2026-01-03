import { Injectable, NotFoundException } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { AddProductDTO } from "./dto";
import { GetIndProduct, GetAllProducts } from "./interface";

@Injectable()
export class ProductsService {

    constructor(private readonly pool: DbService) { };

    async addProduct(product: AddProductDTO) {
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
            throw err;
        } finally {
            client.release();
        }
    };

    async getAllProducts(): Promise<GetAllProducts[]> {
        const response = await this.pool.dbPool().query(`select products.product_id, products.name, products.price, products.stock_quantity,products.description, 
            product_images.image_url from public.products inner join public.product_images on public.products.product_id = public.product_images.product_id where product_images.is_hero = true;`);
        if (response.rows.length === 0) {
            throw new NotFoundException("No products found")
        }
        return response.rows;
    }

    async getIndProduct(productId: string): Promise<GetIndProduct> {
        const response = await this.pool.dbPool().query(`SELECT products.name as product_title, products.price, products.sku, products.stock_quantity, products.description, products.category_id, products.brand_id, products.created_at, products.updated_at, product_images.image_id, product_images.image_url, product_images.is_hero, brands.name as brand_title, brands.description as brand_description, categories.name as category_title FROM public.products inner join public.product_images on products.product_id = product_images.product_id inner join public.categories on products.category_id = categories.category_id inner join public.brands on products.brand_id = brands.brand_id where products.product_id = $1;`, [productId]);
        if (response.rows.length === 0) {
            throw new NotFoundException(`Product with the id: '${productId}' not found`);
        }
        const dataObj = {
            brand_description: response.rows[0].brand_description,
            brand_id: response.rows[0].brand_id,
            brand_title: response.rows[0].brand_title,
            category_id: response.rows[0].category_id,
            category_title: response.rows[0].category_title,
            description: response.rows[0].description,
            heroImageData: { image_id: response.rows[0].image_id, image_url: response.rows[0].image_url, is_hero: response.rows[0].is_hero },
            price: response.rows[0].price,
            product_title: response.rows[0].product_title,
            sku: response.rows[0].sku,
            stock_quantity: response.rows[0].stock_quantity,
            updated_at: response.rows[0].updated_at,
            created_at: response.rows[0].created_at,
        }
        return dataObj;
    }
}