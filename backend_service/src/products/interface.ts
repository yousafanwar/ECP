export interface HeroImage {
    image_id: string;
    image_url: string;
    is_hero: boolean;
}

export interface GetIndProduct {
    brand_description: string;
    brand_id: string;
    brand_title: string;
    category_id: string;
    category_title: string;
    description: string;
    heroImageData: HeroImage;
    price: number;
    product_title: string;
    sku: number;
    stock_quantity: number;
    updated_at: string;
    created_at: string;
}

export interface GetAllProducts {
    product_id: string;
    name: string
    price: number
    stock_quantity: number
    description: string
    image_url: string

}