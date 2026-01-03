import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { FetchAllCategories } from "./interface";

@Injectable()
export class CategoriesService {
    constructor(private readonly pool: DbService) { }

    async fetchAllProducts(): Promise<FetchAllCategories[]> {
        const client = await this.pool.dbPool();
        const response = await client.query(`SELECT category_id, "name" FROM public.categories;`);
        return response.rows;
    }
}