export interface HeroImage {
    image_id: string;
    image_url: string;
    is_hero: boolean;
}

export interface GetIndProduct {
    brand_description: string | null;
    brand_id: string | null;
    brand_title: string | null;
    category_id: string;
    category_title: string | null;
    description: string;
    heroImageData: HeroImage;
    images?: HeroImage[];
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
    category_title: string
    brand_title: string
}

export interface UpdatedProduct {
    product_id: string;
    name: string;
    price: number;
    sku: number;
    stock_quantity: number;
    description: string;
    category_id: string;
    brand_id: string;
    updated_at: string;
}

export interface AddedImages {
    imageIds: string[];
}