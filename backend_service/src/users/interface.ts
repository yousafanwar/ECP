export interface FetchUserById {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface FetchUserByEmail {
    user_id: string;
    first_name: string;
    last_name: string;
    password: string;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}