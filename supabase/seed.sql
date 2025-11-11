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
  target_temperature, temperature, device_path, technician_password
) VALUES
(
  'VM001', 'Центральная аптека', 'пр. Абая 123, Алматы', 43.2389, 76.8897, 'online',
  12, 9600, 8, 0, 1, 4.0, 4.2, '/dev/ttyUSB0', 'tech123'
),
(
  'VM002', 'Торговый центр Астана', 'пр. Республики 456, Астана', 51.1694, 71.4491, 'online',
  10, 9600, 8, 0, 1, 5.0, 4.8, '/dev/ttyUSB1', 'tech456'
),
(
  'VM003', 'Поликлиника №3', 'ул. Байтурсынова 789, Шымкент', 42.3417, 69.5901, 'offline',
  8, 9600, 8, 0, 1, 3.5, 3.7, '/dev/ttyUSB2', 'tech789'
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
INSERT INTO public.orders (machine_id, machine_product_id, status, machine_command, date_paid) VALUES
-- Recent successful orders
(1, 1, 'paid', 'VEND_SLOT_01', NOW() - INTERVAL '30 minutes'),
(1, 3, 'paid', 'VEND_SLOT_03', NOW() - INTERVAL '1 hour'),
(2, 1, 'paid', 'VEND_SLOT_01', NOW() - INTERVAL '2 hours'),
(1, 5, 'paid', 'VEND_SLOT_05', NOW() - INTERVAL '3 hours'),

-- Pending/failed orders
(1, 2, 'created', NULL, NULL),
(2, 4, 'failed', 'VEND_SLOT_04', NOW() - INTERVAL '4 hours'),
(3, 1, 'cancelled', NULL, NOW() - INTERVAL '5 hours'),

-- Older successful orders
(1, 1, 'paid', 'VEND_SLOT_01', NOW() - INTERVAL '1 day'),
(1, 4, 'paid', 'VEND_SLOT_04', NOW() - INTERVAL '1 day'),
(2, 5, 'paid', 'VEND_SLOT_04', NOW() - INTERVAL '2 days'),
(1, 6, 'paid', 'VEND_SLOT_06', NOW() - INTERVAL '3 days');

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
FROM public.orders;