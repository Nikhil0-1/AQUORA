-- ==============================================================================
-- 002_seed_data.sql
-- Seed data for Smart Sanitizer Vending Platform
-- ==============================================================================

-- 1. Insert Categories
INSERT INTO categories (id, name, slug, display_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Signature', 'signature', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Citrus', 'citrus', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Tropical', 'tropical', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Orchard', 'orchard', 4, true),
    ('c5555555-5555-5555-5555-555555555555', 'Blends', 'blends', 5, true)
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Machine VM-001
INSERT INTO machines (id, machine_code, name, location, status, firmware_version, ip_address, last_seen)
VALUES
    ('m0011111-1111-1111-1111-111111111111', 'VM-001', 'Aquora Nexus Core 1', 'CyberHub Tech Park, Tower B (Ground Floor)', 'ONLINE', 'v1.0.0-esp32', '192.168.1.101', NOW())
ON CONFLICT (machine_code) DO NOTHING;

-- 3. Insert 5 Signature Products
INSERT INTO products (
    id, name, slug, description, short_description, category_id,
    price, discount_price, currency, image_url, volume_ml,
    ingredients, nutrition, is_available, is_featured, channel_id
)
VALUES
(
    'p1111111-1111-1111-1111-111111111111',
    'Mango Bliss',
    'mango-bliss',
    'Cold-extracted from sun-ripened Ratnagiri Alphonso mangoes. Rich, velvety, and intensely aromatic with zero added preservatives.',
    'Pure sun-ripened Alphonso nectar with velvety tropical finish.',
    'c3333333-3333-3333-3333-333333333333',
    60.00,
    NULL,
    'INR',
    'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
    250,
    '["Alphonso Mango Pulp", "Natural Fruit Pectin", "Filtered Purified Water", "Splash of Lime"]'::jsonb,
    '{"calories": 135, "sugar_g": 28, "vitamin_c_mg": 45, "carbs_g": 32, "fat_g": 0.2, "protein_g": 1.1}'::jsonb,
    true,
    true,
    3
),
(
    'p2222222-2222-2222-2222-222222222222',
    'Orange Burst',
    'orange-burst',
    'Freshly crushed Nagpur Valencia oranges packed with natural bioflavonoids and immune-boosting vitamin C.',
    'Crisp, invigorating Valencia orange surge with delicate pulp.',
    'c2222222-2222-2222-2222-222222222222',
    40.00,
    NULL,
    'INR',
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
    250,
    '["100% Pressed Valencia Oranges", "Natural Orange Zest Essence"]'::jsonb,
    '{"calories": 110, "sugar_g": 21, "vitamin_c_mg": 72, "carbs_g": 26, "fat_g": 0.1, "protein_g": 1.7}'::jsonb,
    true,
    true,
    1
),
(
    'p3333333-3333-3333-3333-333333333333',
    'Apple Fresh',
    'apple-fresh',
    'Hand-selected crisp Himalayan Fuji and Kinnaur apples. Subtly sweet with a refreshing natural tartness.',
    'Crisp Himalayan mountain apple pressed to crystal clarity.',
    'c4444444-4444-4444-4444-444444444444',
    50.00,
    NULL,
    'INR',
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    250,
    '["Kinnaur Crisp Apples", "Fuji Apple Clarified Extract", "Hint of Ascorbic Acid (Vitamin C)"]'::jsonb,
    '{"calories": 118, "sugar_g": 24, "vitamin_c_mg": 18, "carbs_g": 29, "fat_g": 0.2, "protein_g": 0.5}'::jsonb,
    true,
    true,
    2
),
(
    'p4444444-4444-4444-4444-444444444444',
    'Pineapple Tropic',
    'pineapple-tropic',
    'Sweet and tangy coastal golden pineapples balanced with refreshing natural electrolytes and bromelain enzyme.',
    'Golden coastal pineapple with sparkling tropical tang.',
    'c3333333-3333-3333-3333-333333333333',
    55.00,
    NULL,
    'INR',
    'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80',
    250,
    '["Queen Pineapple Extract", "Golden Crown Cold Press", "Purified Spring Water"]'::jsonb,
    '{"calories": 125, "sugar_g": 25, "vitamin_c_mg": 58, "carbs_g": 31, "fat_g": 0.1, "protein_g": 0.9}'::jsonb,
    true,
    false,
    4
),
(
    'p5555555-5555-5555-5555-555555555555',
    'Mixed Fruit',
    'mixed-fruit',
    'A harmonious blend of pomegranate, sweet grape, mango, guava, and orange for the ultimate multi-nutrient antioxidant rush.',
    'Antioxidant fusion of pomegranate, mango, guava, and citrus.',
    'c5555555-5555-5555-5555-555555555555',
    70.00,
    NULL,
    'INR',
    'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    250,
    '["Ruby Pomegranate", "Alphonso Mango", "Pink Guava", "Valencia Orange", "White Grape"]'::jsonb,
    '{"calories": 142, "sugar_g": 29, "vitamin_c_mg": 65, "carbs_g": 34, "fat_g": 0.3, "protein_g": 1.4}'::jsonb,
    true,
    true,
    5
)
ON CONFLICT (id) DO NOTHING;

-- 4. Machine Channels for VM-001
-- Mapping: Ch 1: Orange, Ch 2: Apple, Ch 3: Mango, Ch 4: Pineapple, Ch 5: Mixed Fruit
INSERT INTO machine_channels (
    machine_id, channel_number, product_id, is_active,
    gpio_pin, flow_sensor_pin, level_sensor_pin,
    current_level_ml, max_capacity_ml, calibration_factor
)
VALUES
    ('m0011111-1111-1111-1111-111111111111', 1, 'p2222222-2222-2222-2222-222222222222', true, 26, 32, 36, 4600, 5000, 4.5),
    ('m0011111-1111-1111-1111-111111111111', 2, 'p3333333-3333-3333-3333-333333333333', true, 27, 33, 39, 4400, 5000, 4.5),
    ('m0011111-1111-1111-1111-111111111111', 3, 'p1111111-1111-1111-1111-111111111111', true, 14, 34, 35, 4800, 5000, 4.5),
    ('m0011111-1111-1111-1111-111111111111', 4, 'p4444444-4444-4444-4444-444444444444', true, 12, 35, 25, 3900, 5000, 4.5),
    ('m0011111-1111-1111-1111-111111111111', 5, 'p5555555-5555-5555-5555-555555555555', true, 13, 23, 19, 4100, 5000, 4.5)
ON CONFLICT (machine_id, channel_number) DO NOTHING;

-- 5. Inventory Records
INSERT INTO inventory (
    machine_id, channel_number, product_id, current_volume_ml, max_volume_ml,
    low_threshold_ml, critical_threshold_ml, status
)
VALUES
    ('m0011111-1111-1111-1111-111111111111', 1, 'p2222222-2222-2222-2222-222222222222', 4600, 5000, 1000, 400, 'GOOD'),
    ('m0011111-1111-1111-1111-111111111111', 2, 'p3333333-3333-3333-3333-333333333333', 4400, 5000, 1000, 400, 'GOOD'),
    ('m0011111-1111-1111-1111-111111111111', 3, 'p1111111-1111-1111-1111-111111111111', 4800, 5000, 1000, 400, 'GOOD'),
    ('m0011111-1111-1111-1111-111111111111', 4, 'p4444444-4444-4444-4444-444444444444', 3900, 5000, 1000, 400, 'GOOD'),
    ('m0011111-1111-1111-1111-111111111111', 5, 'p5555555-5555-5555-5555-555555555555', 4100, 5000, 1000, 400, 'GOOD')
ON CONFLICT (machine_id, channel_number) DO NOTHING;

-- 6. Dispensing Profiles
INSERT INTO dispensing_profiles (id, name, channel_number, target_volume_ml, max_dispense_time_sec, pump_mode, calibration_factor, min_flow_rate_ml_s)
VALUES
    ('dp111111-1111-1111-1111-111111111111', 'Valencia Orange Standard 250ml', 1, 250, 25, 'FLOW_SENSOR', 4.5, 3.0),
    ('dp222222-2222-2222-2222-222222222222', 'Kinnaur Apple Crisp 250ml', 2, 250, 25, 'FLOW_SENSOR', 4.5, 3.0),
    ('dp333333-3333-3333-3333-333333333333', 'Alphonso Mango Nectar 250ml', 3, 250, 30, 'FLOW_SENSOR', 4.8, 2.5),
    ('dp444444-4444-4444-4444-444444444444', 'Pineapple Tropic 250ml', 4, 250, 25, 'FLOW_SENSOR', 4.5, 3.0),
    ('dp555555-5555-5555-5555-555555555555', 'Antioxidant Fusion 250ml', 5, 250, 30, 'FLOW_SENSOR', 4.7, 2.5)
ON CONFLICT (id) DO NOTHING;
