-- Migration 003: Admin Product Management, Soft Delete & Public Web Order Source

-- 1. Add columns to products for archiving & display order
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- 2. Add columns to product_variants for archiving, stock quantity & display order
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS available_quantity INT DEFAULT 100;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- 3. Add order source to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source VARCHAR(30) DEFAULT 'SYSTEM_1_TERMINAL';

-- 4. Create admin_users table for Firebase Auth UID -> AQUORA Admin Role mapping
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'TECHNICIAN')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create inventory_logs table for audit trail of stock adjustments
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_code VARCHAR(50) NOT NULL,
    channel_number INT NOT NULL,
    change_amount_ml NUMERIC(10, 2) NOT NULL,
    resulting_volume_ml NUMERIC(10, 2) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    actor_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS on new tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on admin_users') THEN
        CREATE POLICY "Service role full access on admin_users" ON admin_users FOR ALL USING (auth.role() = 'service_role');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on inventory_logs') THEN
        CREATE POLICY "Service role full access on inventory_logs" ON inventory_logs FOR ALL USING (auth.role() = 'service_role');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on products') THEN
        CREATE POLICY "Service role full access on products" ON products FOR ALL USING (auth.role() = 'service_role');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on product_variants') THEN
        CREATE POLICY "Service role full access on product_variants" ON product_variants FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;
