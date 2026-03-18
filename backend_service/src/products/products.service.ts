import { Injectable, NotFoundException } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { AddProductDTO, UpdateProductDTO, AddProductImagesDTO } from "./dto";
import { GetIndProduct, GetAllProducts, UpdatedProduct, AddedImages } from "./interface";

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
        const response = await this.pool.dbPool().query(`
            SELECT products.product_id, products.name, products.price, products.stock_quantity, products.description,
                product_images.image_url,
                categories.name AS category_title,
                brands.name AS brand_title
            FROM public.products
            INNER JOIN public.product_images ON public.products.product_id = public.product_images.product_id
            LEFT JOIN public.categories ON public.products.category_id = public.categories.category_id
            LEFT JOIN public.brands ON public.products.brand_id = public.brands.brand_id
            WHERE product_images.is_hero = true;
        `);
        if (response.rows.length === 0) {
            throw new NotFoundException("No products found")
        }
        return response.rows;
    }

    async updateProduct(productId: string, product: UpdateProductDTO): Promise<UpdatedProduct> {
        const exists = await this.pool.dbPool().query(
            `SELECT product_id FROM public.products WHERE product_id = $1`,
            [productId]
        );
        if (exists.rows.length === 0) {
            throw new NotFoundException(`Product with id '${productId}' not found`);
        }

        const result = await this.pool.dbPool().query(
            `UPDATE public.products
             SET
               name           = COALESCE($1, name),
               price          = COALESCE($2, price),
               sku            = COALESCE($3, sku),
               stock_quantity = COALESCE($4, stock_quantity),
               description    = COALESCE($5, description),
               category_id    = COALESCE($6::uuid, category_id),
               brand_id       = COALESCE($7::uuid, brand_id),
               updated_at     = CURRENT_TIMESTAMP
             WHERE product_id = $8
             RETURNING product_id, name, price, sku, stock_quantity, description, category_id, brand_id, updated_at;`,
            [
                product.name ?? null,
                product.price ?? null,
                product.sku ?? null,
                product.stock_quantity ?? null,
                product.description ?? null,
                product.category_id ?? null,
                product.brand_id ?? null,
                productId,
            ]
        );
        return result.rows[0];
    }

    async addProductImages(productId: string, dto: AddProductImagesDTO): Promise<AddedImages> {
        const exists = await this.pool.dbPool().query(
            `SELECT product_id FROM public.products WHERE product_id = $1`,
            [productId]
        );
        if (exists.rows.length === 0) {
            throw new NotFoundException(`Product with id '${productId}' not found`);
        }

        const client = await this.pool.dbPool().connect();
        try {
            await client.query('BEGIN');
            const imageIds: string[] = [];
            for (const url of dto.image_urls) {
                const res = await client.query(
                    `INSERT INTO public.product_images(product_id, image_url, is_hero)
                     VALUES($1, $2, false)
                     RETURNING image_id;`,
                    [productId, url]
                );
                imageIds.push(res.rows[0].image_id);
            }
            await client.query('COMMIT');
            return { imageIds };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getIndProduct(productId: string): Promise<GetIndProduct> {
        const response = await this.pool.dbPool().query(`SELECT products.name as product_title, products.price, products.sku, products.stock_quantity, products.description, products.category_id, products.brand_id, products.created_at, products.updated_at, product_images.image_id, product_images.image_url, product_images.is_hero, brands.name as brand_title, brands.description as brand_description, categories.name as category_title FROM public.products inner join public.product_images on products.product_id = product_images.product_id inner join public.categories on products.category_id = categories.category_id inner join public.brands on products.brand_id = brands.brand_id where products.product_id = $1;`, [productId]);
        if (response.rows.length === 0) {
            throw new NotFoundException(`Product with the id: '${productId}' not found`);
        }
        const heroRow = response.rows.find(r => r.is_hero) ?? response.rows[0];
        const additionalImages = response.rows
            .filter(r => !r.is_hero)
            .map(r => ({ image_id: r.image_id, image_url: r.image_url, is_hero: r.is_hero }));

        const dataObj = {
            brand_description: heroRow.brand_description,
            brand_id: heroRow.brand_id,
            brand_title: heroRow.brand_title,
            category_id: heroRow.category_id,
            category_title: heroRow.category_title,
            description: heroRow.description,
            heroImageData: { image_id: heroRow.image_id, image_url: heroRow.image_url, is_hero: heroRow.is_hero },
            images: additionalImages,
            price: heroRow.price,
            product_title: heroRow.product_title,
            sku: heroRow.sku,
            stock_quantity: heroRow.stock_quantity,
            updated_at: heroRow.updated_at,
            created_at: heroRow.created_at,
        }
        return dataObj;
    }
}