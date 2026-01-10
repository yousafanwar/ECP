export interface ProductData {
    product_title: string;
    price: number;
    sku: number;
    stock_quantity: number;
    description: string;
    category_id: number;
    category_title: string;
    brand_id: number;
    brand_title: string;
    brand_description: string;
    heroImageData: HeroImage;
    created_at: string;
    updated_at: string;
}

export interface HeroImage {
    image_id: string;
    image_url: string;
    is_hero: boolean;
}