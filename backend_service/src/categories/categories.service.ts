import { Body, Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { FetchAllCategoriesDTO } from "./dto";

@Injectable()
export class CategoriesService {
    constructor(private readonly pool: DbService) { }

    async fetchAllProducts(): Promise<FetchAllCategoriesDTO[]> {
        const client = await this.pool.dbPool().connect();
        try {
            const response = await client.query(`SELECT category_id, "name" FROM public.categories;`);
            return response.rows;
        } catch (err) {
            console.error('Error while fetching all categories', err);
            throw err;
        } finally {
            client.release();
        }
    }
}