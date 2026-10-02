-- ==============================================================================
-- AQUORA Smart Sanitizer Vending Platform — Full Consolidated Schema
-- Production DDL for Supabase / PostgreSQL
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & PROFILES
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- SUPER_ADMIN, ADMIN, OPERATOR, TECHNICIAN, CUSTOMER
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

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS & VARIANTS
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
    volume_ml INT NOT NULL DEFAULT 100,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    nutrition JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    channel_id INT NOT NULL CHECK (channel_id BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    volume_ml INT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    channel_id INT NOT NULL CHECK (channel_id BETWEEN 1 AND 5),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENT TERMINALS (System 1) & DISPENSING MACHINES (System 2)
CREATE TABLE IF NOT EXISTS payment_terminals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    terminal_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. AQ-PT-001
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    assigned_dispensing_machine_code VARCHAR(50) NOT NULL, -- AQ-DM-001
    status VARCHAR(30) DEFAULT 'ONLINE',
    firmware_version VARCHAR(50) DEFAULT 'v1.0.0-esp32s3',
    ip_address VARCHAR(45),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispensing_machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_code VARCHAR(50) UNIQUE NOT NULL, -- e.g. AQ-DM-001
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(30) DEFAULT 'ONLINE',
    firmware_version VARCHAR(50) DEFAULT 'v1.0.0-esp32',
    ip_address VARCHAR(45),
    api_secret_hash VARCHAR(255),
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machine_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_code VARCHAR(50) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    secret_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(machine_code)
);

CREATE TABLE IF NOT EXISTS machine_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES dispensing_machines(id) ON DELETE CASCADE,
    channel_number INT NOT NULL CHECK (channel_number BETWEEN 1 AND 5),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    gpio_pin INT NOT NULL,
    flow_sensor_pin INT NOT NULL,
    current_level_ml NUMERIC(10, 2) DEFAULT 5000,
    max_capacity_ml NUMERIC(10, 2) DEFAULT 5000,
    calibration_factor NUMERIC(8, 2) DEFAULT 10.0, -- Pulses per ml
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(machine_id, channel_number)
);

-- 5. ORDERS, PAYMENTS & DISPENSE JOBS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(60) UNIQUE NOT NULL,
    customer_name VARCHAR(120),
    customer_phone VARCHAR(30),
    terminal_code VARCHAR(50) NOT NULL,
    machine_code VARCHAR(50) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_status VARCHAR(30) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED')),
    order_status VARCHAR(30) DEFAULT 'CREATED' CHECK (order_status IN (
        'CREATED', 'PAYMENT_PENDING', 'PAID', 'QUEUED', 'AUTHORIZED', 'DISPENSING',
        'DISPENSED', 'FAILED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED'
    )),
    dispensed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(120) NOT NULL,
    channel_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    volume_ml INT NOT NULL DEFAULT 100,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) DEFAULT 'UPI_RAZORPAY',
    provider VARCHAR(50) DEFAULT 'RAZORPAY',
    provider_order_id VARCHAR(100),
    provider_payment_id VARCHAR(100),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(30) DEFAULT 'PENDING',
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispense_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    machine_code VARCHAR(50) NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id),
    channel_id INT NOT NULL CHECK (channel_id BETWEEN 1 AND 5),
    target_volume_ml INT NOT NULL,
    dispensed_volume_ml INT DEFAULT 0,
    flow_rate NUMERIC(6, 2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'ACCEPTED', 'STARTED', 'DISPENSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    signature VARCHAR(255),
    attempt_count INT DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_code VARCHAR(60),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id)
);

-- 6. TELEMETRY, EVENTS, ERRORS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS machine_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_code VARCHAR(50) NOT NULL,
    wifi_rssi INT,
    state VARCHAR(50) NOT NULL,
    pump_states BOOLEAN[] NOT NULL,
    flow_sensor_states BOOLEAN[],
    uptime_seconds BIGINT,
    free_heap INT,
    error_code VARCHAR(60),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machine_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_code VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'INFO',
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machine_errors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_code VARCHAR(50) NOT NULL,
    job_id UUID,
    error_code VARCHAR(60) NOT NULL,
    message TEXT,
    channel INT,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    response_body JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_code VARCHAR(50) NOT NULL,
    channel_number INT NOT NULL CHECK (channel_number BETWEEN 1 AND 5),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_volume_ml NUMERIC(10, 2) NOT NULL DEFAULT 5000,
    max_volume_ml NUMERIC(10, 2) NOT NULL DEFAULT 5000,
    low_threshold_ml NUMERIC(10, 2) NOT NULL DEFAULT 1000,
    status VARCHAR(30) DEFAULT 'GOOD',
    last_refilled_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(machine_code, channel_number)
);

CREATE TABLE IF NOT EXISTS calibrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_code VARCHAR(50) NOT NULL,
    channel_number INT NOT NULL CHECK (channel_number BETWEEN 1 AND 5),
    pulse_count INT NOT NULL,
    test_volume_ml NUMERIC(8, 2) NOT NULL,
    measured_volume_ml NUMERIC(8, 2) NOT NULL,
    calibration_factor NUMERIC(8, 2) NOT NULL,
    operator VARCHAR(100) DEFAULT 'ADMIN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    actor_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH-THROUGHPUT PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_dispense_jobs_status ON dispense_jobs(status);
CREATE INDEX IF NOT EXISTS idx_dispense_jobs_machine ON dispense_jobs(machine_code);
CREATE INDEX IF NOT EXISTS idx_telemetry_machine_time ON machine_telemetry(machine_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_machine ON inventory(machine_code);
