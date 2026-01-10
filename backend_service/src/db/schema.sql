-- users table
create table if not exists users( 
	user_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT null, 
	first_name VARCHAR(255) not null, 
	last_name VARCHAR(255) not null, 
	email VARCHAR(255) unique not null, 
	password VARCHAR(255) not null, 
	is_deleted boolean default false, 
	created_at timestamp default CURRENT_TIMESTAMP, 
	updated_at timestamp default CURRENT_TIMESTAMP 
);

-- enum address type
create type addressType as enum ('billing', 'shipping', 'both'); 

-- address table
create table if not exists address ( 
address_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT null, 
user_id UUID not null, 
street VARCHAR(255) not null, 
city VARCHAR(20) not null, 
state VARCHAR(20), 
country VARCHAR(20) not null, 
type addressType not null, 
created_at timestamp default CURRENT_TIMESTAMP, 
updated_at timestamp default CURRENT_TIMESTAMP, 
foreign key (user_id) references users(user_id) 
);

-- products table
create table if not exists products( 
	product_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT null, 
	name VARCHAR(255) not null, 
	price int not null, 
	sku int unique not null, 
	stock_quantity int not null, 
	description TEXT, 
	category_id UUID not null, 
	brand_id UUID, 
	created_at timestamp default CURRENT_TIMESTAMP, 
	updated_at timestamp default CURRENT_TIMESTAMP, 

	foreign key (category_id) references categories(category_id), 
	foreign key (brand_id) references brands(brand_id) 	
);

-- product images table
create table if not exists product_images ( 
	image_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT Null,  
	product_id UUID not null, 
	image_url TEXT not null, 
	is_hero boolean default false, 
	created_at timestamp default CURRENT_TIMESTAMP, 
	
	foreign key (product_id) references products(product_id) 
);

-- categories table
create table if not exists categories( 
	category_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT Null, 
	name VARCHAR(255) not null 
);

-- brands table
create table if not exists brands( 
	brand_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT Null,
	name VARCHAR(255) not null, 
	description TEXT not null 
);

-- cart table
drop table if exists cart; 
create table if not exists cart( 
	cart_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
	user_id UUID not null, 
	foreign key (user_id) references users(user_id) 
);

-- cart items table
create table if not exists cart_items( 
	cart_items UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL, 
	cart_id UUID not null, 
	product_id UUID not null, 
	quantity int not null, 
	foreign key (cart_id) references cart(cart_id), 
	foreign key (product_id) references products(product_id) 
);

-- orders_status enum
create type order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

-- orders table
create table if not exists orders( 
	order_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,  
	user_id UUID not null, 
	address_id UUID, 
	status order_status not null, 
	total_amount int not null, 
	created_at timestamp default CURRENT_TIMESTAMP, 
	foreign key (user_id) references users(user_id), 
	foreign key (address_id) references address(address_id) 
);

alter table orders drop column total_amount;

-- order items table
create table if not exists order_items( 
	order_item_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL, 
	order_id UUID, 
	product_id UUID, 
	quantity int, 
	price int, 
	foreign key (order_id) references orders(order_id), 
	foreign key (product_id) references products(product_id) 
);

-- payment_method and payment_status enums
create type payment_method as enum ('card', 'COD'); 
create type payment_status as enum ('pending', 'successful', 'failed');

-- payments table
create table if not exists payments( 
	payment_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL, 
	order_id UUID, 
	payment_type payment_method not null, 
	amount int, 
	status payment_status not null, 
	transaction_id UUID, 
	created_at timestamp default CURRENT_TIMESTAMP, 
	foreign key (order_id) references orders(order_id) 
);

ALTER TABLE public.cart_items RENAME COLUMN cart_items TO cart_item_id;