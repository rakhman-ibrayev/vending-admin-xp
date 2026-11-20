-- Seed data for vending machine admin system
-- This file runs after migrations and populates the database with sample data

-- Create test user directly in auth tables
-- Based on Stack Overflow solution: https://stackoverflow.com/a/...
INSERT INTO
    auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    )
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'authenticated',
    'authenticated',
    'user@mail.com',
    extensions.crypt('Qwerty123', extensions.gen_salt('bf')),
    current_timestamp,
    current_timestamp,
    current_timestamp,
    '{"provider":"email","providers":["email"]}',
    '{"name":"Test User","role":"admin"}',
    current_timestamp,
    current_timestamp,
    '',
    '',
    '',
    ''
);

-- Create identity for the test user
INSERT INTO
    auth.identities (
        id,
        provider_id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    )
VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    '{"sub":"550e8400-e29b-41d4-a716-446655440000","email":"user@mail.com"}'::jsonb,
    'email',
    current_timestamp,
    current_timestamp,
    current_timestamp
);

-- Insert sample products
INSERT INTO public.products (name, sku, price, stock, category, unit, image) VALUES
('Аспирин', 'ASP-100', 150, 100, 'Лекарства', 'таб', 'https://example.com/aspirin.jpg'),
('Парацетамол', 'PAR-500', 140, 80, 'Лекарства', 'таб', 'https://example.com/paracetamol.jpg'),
('Витамин C', 'VITC-1000', 120, 60, 'Витамины', 'таб', 'https://example.com/vitamin-c.jpg'),
('Бинт медицинский', 'BAND-5M', 200, 40, 'Перевязочные материалы', 'м', 'https://example.com/bandage.jpg'),
('Вода минеральная', 'WATER-500', 80, 120, 'Напитки', 'мл', 'https://example.com/mineral-water.jpg'),
('Сироп от кашля', 'COUGH-100', 180, 30, 'Лекарства', 'мл', 'https://example.com/cough-syrup.jpg');

-- Insert sample vending machines
INSERT INTO public.vending_machines (
  serial_number, name, location, latitude, longitude, status,
  num_slots, baud_rate, data_bits, parity, stop_bits,
  device_path, technician_password
) VALUES
(
  'VM001', 'Центральная аптека', 'пр. Абая 123, Алматы', 43.2389, 76.8897, 'online',
  10, 115200, 8, 0, 1, '/dev/ttyUSB0', 'tech123'
),
(
  'VM002', 'Торговый центр Астана', 'пр. Республики 456, Астана', 51.1694, 71.4491, 'online',
  10, 115200, 8, 0, 1, '/dev/ttyUSB1', 'tech456'
),
(
  'VM003', 'Поликлиника №3', 'ул. Байтурсынова 789, Шымкент', 42.3417, 69.5901, 'offline',
  8, 115200, 8, 0, 1, '/dev/ttyUSB2', 'tech789'
);

-- Insert machine products (products in vending machines)
INSERT INTO public.machine_products (machine_id, product_id, slot_index, current_stock, max_capacity, last_restocked) VALUES
-- VM001 products
(1, 1, 1, 10, 15, NOW()), -- Аспирин in slot 1
(1, 2, 2, 8, 15, NOW()),  -- Парацетамол in slot 2
(1, 3, 3, 5, 10, NOW()),  -- Витамин C in slot 3
(1, 4, 4, 3, 8, NOW()),   -- Бинт медицинский in slot 4
(1, 5, 5, 12, 20, NOW()), -- Вода минеральная in slot 5
(1, 6, 6, 2, 6, NOW()),   -- Сироп от кашля in slot 6

-- VM002 products
(2, 1, 1, 12, 15, NOW()), -- Аспирин in slot 1
(2, 3, 2, 7, 10, NOW()),  -- Витамин C in slot 2
(2, 4, 3, 4, 8, NOW()),   -- Бинт медицинский in slot 3
(2, 5, 4, 15, 20, NOW()), -- Вода минеральная in slot 4
(2, 6, 5, 1, 6, NOW()),   -- Сироп от кашля in slot 5

-- VM003 products (offline machine, lower stock)
(3, 1, 1, 3, 15, NOW() - INTERVAL '2 days'), -- Аспирин in slot 1
(3, 2, 2, 2, 15, NOW() - INTERVAL '2 days'), -- Парацетамол in slot 2
(3, 5, 3, 5, 20, NOW() - INTERVAL '2 days'); -- Вода минеральная in slot 3

-- Insert sample orders
INSERT INTO public.orders (machine_id, machine_product_id, status, machine_command, date_paid, amount_paid, product_name, product_sku, product_category, slot_index, created_at) VALUES
-- Recent successful orders (today)
(1, 1, 'paid', 'VEND_SLOT_01', NOW() - INTERVAL '30 minutes', 150, 'Аспирин', 'ASP-100', 'Лекарства', 1, NOW() - INTERVAL '30 minutes'),
(1, 3, 'paid', 'VEND_SLOT_03', NOW() - INTERVAL '1 hour', 120, 'Витамин C', 'VITC-1000', 'Витамины', 3, NOW() - INTERVAL '1 hour'),
(2, 1, 'paid', 'VEND_SLOT_01', NOW() - INTERVAL '2 hours', 150, 'Аспирин', 'ASP-100', 'Лекарства', 1, NOW() - INTERVAL '2 hours'),
(1, 5, 'paid', 'VEND_SLOT_05', NOW() - INTERVAL '3 hours', 80, 'Вода минеральная', 'WATER-500', 'Напитки', 5, NOW() - INTERVAL '3 hours'),

-- Pending/failed orders (today)
(1, 2, 'created', NULL, NULL, NULL, 'Парацетамол', 'PAR-500', 'Лекарства', 2, NOW() - INTERVAL '4 hours'),
(2, 4, 'failed', 'VEND_SLOT_04', NULL, NULL, 'Вода минеральная', 'WATER-500', 'Напитки', 4, NOW() - INTERVAL '5 hours'),
(3, 1, 'cancelled', NULL, NULL, NULL, 'Аспирин', 'ASP-100', 'Лекарства', 1, NOW() - INTERVAL '6 hours'),

-- Older successful orders (previous days)
(1, 1, 'paid', 'VEND_SLOT_01', NOW() - INTERVAL '1 day', 150, 'Аспирин', 'ASP-100', 'Лекарства', 1, NOW() - INTERVAL '1 day'),
(1, 4, 'paid', 'VEND_SLOT_04', NOW() - INTERVAL '1 day', 200, 'Бинт медицинский', 'BAND-5M', 'Перевязочные материалы', 4, NOW() - INTERVAL '1 day'),
(2, 5, 'paid', 'VEND_SLOT_04', NOW() - INTERVAL '2 days', 80, 'Вода минеральная', 'WATER-500', 'Напитки', 4, NOW() - INTERVAL '2 days'),
(1, 6, 'paid', 'VEND_SLOT_06', NOW() - INTERVAL '3 days', 180, 'Сироп от кашля', 'COUGH-100', 'Лекарства', 6, NOW() - INTERVAL '3 days');

-- Insert sample product sales by day
INSERT INTO public.product_sales_by_day (day, machine_id, product_id, num_sales, amount) VALUES
-- Today's sales
(DATE(NOW()), 1, 1, 1, 150), -- Aspirin on machine 1
(DATE(NOW()), 1, 3, 1, 120), -- Vitamin C on machine 1
(DATE(NOW()), 2, 1, 1, 150), -- Aspirin on machine 2
(DATE(NOW()), 1, 5, 1, 80),  -- Mineral water on machine 1

-- Yesterday's sales
(DATE(NOW() - INTERVAL '1 day'), 1, 1, 1, 150), -- Aspirin on machine 1
(DATE(NOW() - INTERVAL '1 day'), 1, 4, 1, 200), -- Medical bandage on machine 1

-- Two days ago
(DATE(NOW() - INTERVAL '2 days'), 2, 5, 1, 80),  -- Mineral water on machine 2

-- Three days ago
(DATE(NOW() - INTERVAL '3 days'), 1, 6, 1, 180), -- Cough syrup on machine 1

-- October 2025 sales
('2025-10-01', 1, 1, 5, 750), -- Aspirin on machine 1
('2025-10-01', 1, 5, 10, 800), -- Water on machine 1
('2025-10-01', 2, 1, 3, 450), -- Aspirin on machine 2
('2025-10-01', 2, 5, 8, 640), -- Water on machine 2
('2025-10-01', 3, 1, 2, 300), -- Aspirin on machine 3
('2025-10-01', 3, 5, 4, 320), -- Water on machine 3

('2025-10-15', 1, 1, 7, 1050), -- Aspirin on machine 1
('2025-10-15', 1, 2, 4, 560), -- Paracetamol on machine 1
('2025-10-15', 1, 5, 12, 960), -- Water on machine 1
('2025-10-15', 2, 1, 5, 750), -- Aspirin on machine 2
('2025-10-15', 2, 3, 3, 360), -- Vitamin C on machine 2
('2025-10-15', 2, 5, 9, 720), -- Water on machine 2
('2025-10-15', 3, 1, 1, 150), -- Aspirin on machine 3
('2025-10-15', 3, 2, 2, 280), -- Paracetamol on machine 3

('2025-10-30', 1, 1, 6, 900), -- Aspirin on machine 1
('2025-10-30', 1, 3, 5, 600), -- Vitamin C on machine 1
('2025-10-30', 1, 5, 15, 1200), -- Water on machine 1
('2025-10-30', 2, 1, 4, 600), -- Aspirin on machine 2
('2025-10-30', 2, 4, 2, 400), -- Bandage on machine 2
('2025-10-30', 2, 5, 11, 880), -- Water on machine 2
('2025-10-30', 3, 5, 3, 240), -- Water on machine 3

-- September 2025 sales
('2025-09-01', 1, 1, 4, 600), -- Aspirin on machine 1
('2025-09-01', 1, 5, 9, 720), -- Water on machine 1
('2025-09-01', 2, 1, 2, 300), -- Aspirin on machine 2
('2025-09-01', 2, 5, 7, 560), -- Water on machine 2
('2025-09-01', 3, 1, 3, 450), -- Aspirin on machine 3
('2025-09-01', 3, 5, 5, 400), -- Water on machine 3

('2025-09-15', 1, 1, 8, 1200), -- Aspirin on machine 1
('2025-09-15', 1, 2, 3, 420), -- Paracetamol on machine 1
('2025-09-15', 1, 5, 14, 1120), -- Water on machine 1
('2025-09-15', 2, 1, 6, 900), -- Aspirin on machine 2
('2025-09-15', 2, 3, 4, 480), -- Vitamin C on machine 2
('2025-09-15', 2, 5, 10, 800), -- Water on machine 2
('2025-09-15', 3, 1, 2, 300), -- Aspirin on machine 3
('2025-09-15', 3, 2, 1, 140), -- Paracetamol on machine 3

('2025-09-30', 1, 1, 5, 750), -- Aspirin on machine 1
('2025-09-30', 1, 4, 3, 600), -- Bandage on machine 1
('2025-09-30', 1, 5, 13, 1040), -- Water on machine 1
('2025-09-30', 2, 1, 3, 450), -- Aspirin on machine 2
('2025-09-30', 2, 5, 8, 640), -- Water on machine 2
('2025-09-30', 3, 5, 4, 320), -- Water on machine 3

-- August 2025 sales
('2025-08-01', 1, 1, 3, 450), -- Aspirin on machine 1
('2025-08-01', 1, 5, 8, 640), -- Water on machine 1
('2025-08-01', 2, 1, 4, 600), -- Aspirin on machine 2
('2025-08-01', 2, 5, 6, 480), -- Water on machine 2
('2025-08-01', 3, 1, 1, 150), -- Aspirin on machine 3
('2025-08-01', 3, 5, 3, 240), -- Water on machine 3

('2025-08-15', 1, 1, 6, 900), -- Aspirin on machine 1
('2025-08-15', 1, 2, 2, 280), -- Paracetamol on machine 1
('2025-08-15', 1, 5, 11, 880), -- Water on machine 1
('2025-08-15', 2, 1, 5, 750), -- Aspirin on machine 2
('2025-08-15', 2, 3, 3, 360), -- Vitamin C on machine 2
('2025-08-15', 2, 5, 9, 720), -- Water on machine 2
('2025-08-15', 3, 1, 2, 300), -- Aspirin on machine 3
('2025-08-15', 3, 2, 1, 140), -- Paracetamol on machine 3

('2025-08-30', 1, 1, 4, 600), -- Aspirin on machine 1
('2025-08-30', 1, 3, 4, 480), -- Vitamin C on machine 1
('2025-08-30', 1, 5, 10, 800), -- Water on machine 1
('2025-08-30', 2, 1, 2, 300), -- Aspirin on machine 2
('2025-08-30', 2, 4, 1, 200), -- Bandage on machine 2
('2025-08-30', 2, 5, 7, 560), -- Water on machine 2
('2025-08-30', 3, 5, 2, 160); -- Water on machine 3

-- Update machine last_seen timestamps
UPDATE public.vending_machines SET last_seen = NOW() WHERE status = 'online';
UPDATE public.vending_machines SET last_seen = NOW() - INTERVAL '1 day' WHERE status = 'offline';

-- Display summary
SELECT
  'Products created' as info,
  COUNT(*) as count
FROM public.products
UNION ALL
SELECT
  'Vending machines created',
  COUNT(*)
FROM public.vending_machines
UNION ALL
SELECT
  'Machine products loaded',
  COUNT(*)
FROM public.machine_products
UNION ALL
SELECT
  'Orders created',
  COUNT(*)
FROM public.orders
UNION ALL
SELECT
  'Product sales by day created',
  COUNT(*)
FROM public.product_sales_by_day;