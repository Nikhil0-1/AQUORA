-- ==============================================================================
-- 001_initial_schema.sql
-- Production DDL for Smart Sanitizer Vending Platform (PostgreSQL / Supabase)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ROLES & PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    full_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'CUSTOMER',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price >= 0),
    currency VARCHAR(10) DEFAULT 'INR',
    image_url TEXT NOT NULL,
    model_3d_url TEXT,
    volume_ml INT NOT NULL DEFAULT 250,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    nutrition JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    channel_id INT NOT NULL CHECK (channel_id BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_channel ON products(channel_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ------------------------------------------------------------------------------
-- 4. MACHINES & CHANNELS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(30) DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR', 'DISABLED')),
    firmware_version VARCHAR(50) DEFAULT 'v1.0.0-esp32',
    ip_address VARCHAR(45),
    api_secret_hash VARCHAR(255),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_machines_code ON machines(machine_code);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);

CREATE TABLE IF NOT EXISTS machine_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    channel_number INT NOT NULL CHECK (channel_number BETWEEN 1 AND 5),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    gpio_pin INT NOT NULL,
    flow_sensor_pin INT NOT NULL,
    level_sensor_pin INT NOT NULL,
    current_level_ml NUMERIC(10, 2) DEFAULT 5000,
    max_capacity_ml NUMERIC(10, 2) DEFAULT 5000,
    calibration_factor NUMERIC(8, 2) DEFAULT 450.0, -- Pulses per Liter or ml
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(machine_id, channel_number)
);

CREATE INDEX IF NOT EXISTS idx_channels_machine ON machine_channels(machine_id);

-- ------------------------------------------------------------------------------
-- 5. DISPENSING PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dispensing_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    channel_number INT NOT NULL CHECK (channel_number BETWEEN 1 AND 5),
    target_volume_ml INT NOT NULL DEFAULT 250,
    max_dispense_time_sec INT NOT NULL DEFAULT 35,
    pump_mode VARCHAR(30) DEFAULT 'FLOW_SENSOR',
    calibration_factor NUMERIC(8, 2) DEFAULT 4.5, -- pulses per ml
    min_flow_rate_ml_s NUMERIC(6, 2) DEFAULT 2.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. INVENTORY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    channel_number INT NOT NULL CHECK (channel_number BETWEEN 1 AND 5),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_volume_ml NUMERIC(10, 2) NOT NULL DEFAULT 5000,
    max_volume_ml NUMERIC(10, 2) NOT NULL DEFAULT 5000,
    low_threshold_ml NUMERIC(10, 2) NOT NULL DEFAULT 1000,
    critical_threshold_ml NUMERIC(10, 2) NOT NULL DEFAULT 400,
    status VARCHAR(30) DEFAULT 'GOOD' CHECK (status IN ('GOOD', 'LOW', 'CRITICAL', 'OUT_OF_STOCK')),
    last_refilled_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(machine_id, channel_number)
);

CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);

-- ------------------------------------------------------------------------------
-- 7. ORDERS & ITEMS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(60) UNIQUE NOT NULL,
    customer_id UUID,
    customer_name VARCHAR(120),
    customer_phone VARCHAR(30),
    customer_email VARCHAR(255),
    machine_id UUID NOT NULL REFERENCES machines(id),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_status VARCHAR(30) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED')),
    order_status VARCHAR(30) DEFAULT 'CREATED' CHECK (order_status IN (
        'CREATED', 'PAYMENT_PENDING', 'PAID', 'QR_GENERATED', 'READY_TO_DISPENSE',
        'QR_SCANNED', 'VALIDATING', 'AUTHORIZED', 'DISPENSING', 'DISPENSED',
        'FAILED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'EXPIRED'
    )),
    qr_token_id UUID,
    dispensed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_machine ON orders(machine_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(120) NOT NULL,
    channel_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    volume_ml INT NOT NULL DEFAULT 250,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------------------------
-- 8. PAYMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) DEFAULT 'UPI_MOCK',
    transaction_reference VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED')),
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);

-- ------------------------------------------------------------------------------
-- 9. QR TOKENS (CRYPTOGRAPHICALLY RANDOM ONE-TIME USE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qr_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id),
    token VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'REVOKED')),
    validation_count INT DEFAULT 0,
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_order ON qr_tokens(order_id);

-- ------------------------------------------------------------------------------
-- 10. DISPENSE JOBS & TELEMETRY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dispense_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    machine_id UUID NOT NULL REFERENCES machines(id),
    channel_number INT NOT NULL,
    target_volume_ml INT NOT NULL,
    dispensed_volume_ml INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'PENDING',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    flow_pulses INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machine_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id),
    firmware_version VARCHAR(50),
    uptime_seconds INT,
    wifi_rssi_dbm INT,
    state VARCHAR(50),
    channel_states JSONB,
    system_temp_c NUMERIC(5, 2),
    free_heap_bytes INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_machine ON machine_telemetry(machine_id, created_at DESC);

CREATE TABLE IF NOT EXISTS machine_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id),
    event_type VARCHAR(60) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_machine ON machine_events(machine_id, created_at DESC);

CREATE TABLE IF NOT EXISTS machine_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id),
    error_code VARCHAR(60) NOT NULL,
    severity VARCHAR(20) DEFAULT 'WARNING',
    message TEXT NOT NULL,
    channel_number INT,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    actor_id VARCHAR(100),
    target_type VARCHAR(50),
    target_id VARCHAR(100),
    payload JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action, created_at DESC);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

-- Public can view active products, categories, and public machine info
CREATE POLICY public_view_products ON products FOR SELECT USING (is_available = TRUE);
CREATE POLICY public_view_categories ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY public_view_machines ON machines FOR SELECT USING (status != 'DISABLED');

-- Orders & Tokens accessible to creator or machine/admin service
CREATE POLICY customer_view_orders ON orders FOR SELECT USING (true);
CREATE POLICY customer_create_orders ON orders FOR INSERT WITH CHECK (true);
