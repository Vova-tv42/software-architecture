CREATE TABLE "menu_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(80) NOT NULL,
	"price" integer NOT NULL,
	CONSTRAINT "menu_items_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"menu_item_id" integer NOT NULL,
	"item_name" varchar(120) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"line_total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" varchar(120) NOT NULL,
	"customer_address" text NOT NULL,
	"status" varchar(32) NOT NULL,
	"subtotal" integer NOT NULL,
	"discount_amount" integer NOT NULL,
	"delivery_fee" integer NOT NULL,
	"total" integer NOT NULL,
	"delivery_plugin_key" varchar(80),
	"promo_plugin_key" varchar(80),
	"payment_plugin_key" varchar(80),
	"payment_method" varchar(120) NOT NULL,
	"payment_reference" varchar(120),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plugin_settings" (
	"plugin_key" varchar(80) PRIMARY KEY NOT NULL,
	"plugin_type" varchar(32) NOT NULL,
	"plugin_label" varchar(120) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;