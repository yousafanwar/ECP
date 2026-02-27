import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { FetchAllBrands } from "./interface";
import { CreateBrandDTO } from "./dto";

@Injectable()
export class BrandsService {
    constructor(private readonly pool: DbService) { }

    async fetchAllBrands(): Promise<FetchAllBrands[]> {
        const client = await this.pool.dbPool();
        const response = await client.query(`SELECT brand_id, "name", description FROM public.brands;`);
        return response.rows;
    }

    async createBrand(createBrandDTO: CreateBrandDTO): Promise<{ brand_id: string }> {
        const client = await this.pool.dbPool();
        const { name, description } = createBrandDTO;
        const response = await client.query(
            `INSERT INTO public.brands ("name", description) VALUES ($1, $2) RETURNING brand_id;`,
            [name, description]
        );
        return { brand_id: response.rows[0].brand_id };
    }
}