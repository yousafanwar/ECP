import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { FetchAllCategories } from "./interface";
import { CreateCategoryDTO } from "./dto";

@Injectable()
export class CategoriesService {
    constructor(private readonly pool: DbService) { }

    async fetchAllCategories(): Promise<FetchAllCategories[]> {
        const client = await this.pool.dbPool();
        const response = await client.query(`SELECT category_id, "name", description FROM public.categories;`);
        return response.rows;
    }

    async createCategory(createCategoryDTO: CreateCategoryDTO): Promise<{ category_id: string }> {
        const client = await this.pool.dbPool();
        const { name, description } = createCategoryDTO;
        const response = await client.query(
            `INSERT INTO public.categories ("name", description) VALUES ($1, $2) RETURNING category_id;`,
            [name, description]
        );
        return { category_id: response.rows[0].category_id };
    }
}