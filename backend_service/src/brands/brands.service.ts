 import { Body, Injectable } from "@nestjs/common";
 import { DbService } from "src/db/db.service";
 import { CreateBrandDTO } from "./dto";

@Injectable()
export class BrandsService {
    constructor(private readonly pool: DbService){}

    async fetchAllBrands () : Promise<CreateBrandDTO[]> {
        const client = await this.pool.dbPool().connect();
        try{
            const response = await client.query(`SELECT brand_id, "name", description FROM public.brands;`);
            return response.rows;
        }catch(err){
            console.error('Error while fetching all brands', err);
            throw err;
        }finally{
            client.release();
        }
    }
}