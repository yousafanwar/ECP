import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { FetchAllBrands } from "./interface";

@Injectable()
export class BrandsService {
    constructor(private readonly pool: DbService) { }

    async fetchAllBrands(): Promise<FetchAllBrands[]> {
        const client = await this.pool.dbPool();
        const response = await client.query(`SELECT brand_id, "name", description FROM public.brands;`);
        return response.rows;
    }
}