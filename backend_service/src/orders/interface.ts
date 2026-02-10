export interface OrderItems {
    order_item_id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
}

// orderItems
export interface OrderAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    type: string;
}

export interface OrderItems {
    quantity: number;
    name: string;
    price: number;
    isHeroImage: boolean;
    image_url: string;
}