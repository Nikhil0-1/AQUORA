-- ==============================================================================
-- AQUORA Smart Sanitizer Vending Platform — Seed Data
-- ==============================================================================

-- 1. Roles
INSERT INTO roles (name, description) VALUES
    ('SUPER_ADMIN', 'Platform Administrator with full privileges'),
    ('ADMIN', 'Operator Manager with configuration privileges'),
    ('OPERATOR', 'Refill and operations personnel'),
    ('TECHNICIAN', 'Maintenance and hardware calibration engineer'),
    ('CUSTOMER', 'End-user customer')
ON CONFLICT (name) DO NOTHING;

-- 2. Terminals & Machines
INSERT INTO dispensing_machines (id, machine_code, name, location, status, firmware_version, ip_address, api_secret_hash) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'AQ-DM-001', 'Dispenser Unit 01 - Main Lobby', 'Building A, Ground Floor Lobby', 'ONLINE', 'v1.0.0-esp32', '192.168.1.102', 'sha256_mock_hash_for_testing_purposes')
ON CONFLICT (machine_code) DO NOTHING;

INSERT INTO payment_terminals (id, terminal_code, name, location, assigned_dispensing_machine_code, status, firmware_version, ip_address) VALUES
    ('t1111111-1111-1111-1111-111111111111', 'AQ-PT-001', 'Touch Terminal 01 - Kiosk', 'Building A, Ground Floor Lobby', 'AQ-DM-001', 'ONLINE', 'v1.0.0-esp32s3', '192.168.1.101')
ON CONFLICT (terminal_code) DO NOTHING;

-- 3. Products (5 Channels)
INSERT INTO products (id, name, slug, description, short_description, price, currency, image_url, volume_ml, channel_id, is_available) VALUES
    ('p1111111-1111-1111-1111-111111111111', 'Classic Sanitizer', 'classic-sanitizer', '70% Isopropyl Alcohol hospital-grade sanitizing formula with fast-drying action.', 'Hospital Grade Instant Hand Sanitizer', 25.00, 'INR', '/assets/products/classic.png', 100, 1, true),
    ('p2222222-2222-2222-2222-222222222222', 'Aloe Vera Sanitizer', 'aloe-vera-sanitizer', 'Enriched with organic aloe vera extract and vitamin E for deep skin moisturization.', 'Moisturizing Sanitizer with Natural Aloe Vera', 30.00, 'INR', '/assets/products/aloe.png', 100, 2, true),
    ('p3333333-3333-3333-3333-333333333333', 'Herbal Citrus Sanitizer', 'herbal-citrus-sanitizer', 'Infused with natural lemongrass and citrus essential oils for a refreshing aroma.', 'Organic Lemongrass & Citrus Essential Oil Blend', 35.00, 'INR', '/assets/products/herbal.png', 100, 3, true),
    ('p4444444-4444-4444-4444-444444444444', 'Premium Gold Sanitizer', 'premium-gold-sanitizer', 'Luxury therapeutic formulation with pro-vitamin B5 and lavender calming notes.', 'Luxury Sanitizer with Pro-Vitamin B5', 50.00, 'INR', '/assets/products/premium.png', 100, 4, true),
    ('p5555555-5555-5555-5555-555555555555', 'Family Care Sanitizer', 'family-care-sanitizer', 'Hypoallergenic fragrance-free formula gentle enough for sensitive skin and children.', 'Hypoallergenic Gentle Sanitizer for All Ages', 40.00, 'INR', '/assets/products/family.png', 100, 5, true)
ON CONFLICT (slug) DO NOTHING;

-- 4. Product Variants (50ml, 100ml, 150ml, 250ml, 500ml)
INSERT INTO product_variants (product_id, volume_ml, price, channel_id, is_available) VALUES
    ('p1111111-1111-1111-1111-111111111111', 50, 15.00, 1, true),
    ('p1111111-1111-1111-1111-111111111111', 100, 25.00, 1, true),
    ('p1111111-1111-1111-1111-111111111111', 150, 35.00, 1, true),
    ('p1111111-1111-1111-1111-111111111111', 250, 55.00, 1, true),
    ('p1111111-1111-1111-1111-111111111111', 500, 95.00, 1, true),

    ('p2222222-2222-2222-2222-222222222222', 50, 20.00, 2, true),
    ('p2222222-2222-2222-2222-222222222222', 100, 30.00, 2, true),
    ('p2222222-2222-2222-2222-222222222222', 150, 45.00, 2, true),
    ('p2222222-2222-2222-2222-222222222222', 250, 70.00, 2, true),
    ('p2222222-2222-2222-2222-222222222222', 500, 120.00, 2, true),

    ('p3333333-3333-3333-3333-333333333333', 50, 22.00, 3, true),
    ('p3333333-3333-3333-3333-333333333333', 100, 35.00, 3, true),
    ('p3333333-3333-3333-3333-333333333333', 250, 80.00, 3, true),

    ('p4444444-4444-4444-4444-444444444444', 50, 30.00, 4, true),
    ('p4444444-4444-4444-4444-444444444444', 100, 50.00, 4, true),
    ('p4444444-4444-4444-4444-444444444444', 250, 110.00, 4, true),

    ('p5555555-5555-5555-5555-555555555555', 50, 25.00, 5, true),
    ('p5555555-5555-5555-5555-555555555555', 100, 40.00, 5, true),
    ('p5555555-5555-5555-5555-555555555555', 250, 90.00, 5, true),
    ('p5555555-5555-5555-5555-555555555555', 500, 150.00, 5, true);

-- 5. Machine Channels (GPIO 25, 26, 27, 14, 12 for Pumps; 34, 35, 32, 33, 39 for Flow Sensors)
INSERT INTO machine_channels (machine_id, channel_number, product_id, is_active, gpio_pin, flow_sensor_pin, current_level_ml, max_capacity_ml, calibration_factor) VALUES
    ('d1111111-1111-1111-1111-111111111111', 1, 'p1111111-1111-1111-1111-111111111111', true, 25, 34, 4500.0, 5000.0, 10.0),
    ('d1111111-1111-1111-1111-111111111111', 2, 'p2222222-2222-2222-2222-222222222222', true, 26, 35, 4800.0, 5000.0, 10.0),
    ('d1111111-1111-1111-1111-111111111111', 3, 'p3333333-3333-3333-3333-333333333333', true, 27, 32, 4200.0, 5000.0, 10.0),
    ('d1111111-1111-1111-1111-111111111111', 4, 'p4444444-4444-4444-4444-444444444444', true, 14, 33, 3900.0, 5000.0, 10.0),
    ('d1111111-1111-1111-1111-111111111111', 5, 'p5555555-5555-5555-5555-555555555555', true, 12, 39, 4900.0, 5000.0, 10.0)
ON CONFLICT (machine_id, channel_number) DO NOTHING;

-- 6. Inventory & Baseline Calibrations
INSERT INTO inventory (machine_code, channel_number, product_id, current_volume_ml, max_volume_ml, low_threshold_ml, status) VALUES
    ('AQ-DM-001', 1, 'p1111111-1111-1111-1111-111111111111', 4500.0, 5000.0, 1000.0, 'GOOD'),
    ('AQ-DM-001', 2, 'p2222222-2222-2222-2222-222222222222', 4800.0, 5000.0, 1000.0, 'GOOD'),
    ('AQ-DM-001', 3, 'p3333333-3333-3333-3333-333333333333', 4200.0, 5000.0, 1000.0, 'GOOD'),
    ('AQ-DM-001', 4, 'p4444444-4444-4444-4444-444444444444', 3900.0, 5000.0, 1000.0, 'GOOD'),
    ('AQ-DM-001', 5, 'p5555555-5555-5555-5555-555555555555', 4900.0, 5000.0, 1000.0, 'GOOD')
ON CONFLICT (machine_code, channel_number) DO NOTHING;

INSERT INTO calibrations (machine_code, channel_number, pulse_count, test_volume_ml, measured_volume_ml, calibration_factor, operator) VALUES
    ('AQ-DM-001', 1, 1000, 100.0, 100.0, 10.0, 'INITIAL_FACTORY'),
    ('AQ-DM-001', 2, 1000, 100.0, 100.0, 10.0, 'INITIAL_FACTORY'),
    ('AQ-DM-001', 3, 1000, 100.0, 100.0, 10.0, 'INITIAL_FACTORY'),
    ('AQ-DM-001', 4, 1000, 100.0, 100.0, 10.0, 'INITIAL_FACTORY'),
    ('AQ-DM-001', 5, 1000, 100.0, 100.0, 10.0, 'INITIAL_FACTORY');
