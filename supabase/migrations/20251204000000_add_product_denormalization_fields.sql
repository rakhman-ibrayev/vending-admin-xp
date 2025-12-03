-- Add denormalized product fields to orders table
-- These fields will be populated when an order is paid

alter table "public"."orders" add column "product_name" text;
alter table "public"."orders" add column "product_sku" text;
alter table "public"."orders" add column "product_category" text;
alter table "public"."orders" add column "slot_index" integer;
