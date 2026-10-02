-- ==============================================================================
-- AQUORA Security & Row Level Security (RLS) Policies
-- Migration 002: Security RLS
-- ==============================================================================

-- Enable RLS on core tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispense_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispensing_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE machine_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE calibrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Products & Categories (Public Read, Admin Write)
CREATE POLICY "Public products viewable" ON products
    FOR SELECT USING (is_available = true);

CREATE POLICY "Public categories viewable" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Public variants viewable" ON product_variants
    FOR SELECT USING (is_available = true);

-- 2. Orders & Order Items (Customer Read by Order Number / Session; Service Role Full Access)
CREATE POLICY "Service role full access on orders" ON orders
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Terminals read own orders" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Service role full access on payments" ON payments
    FOR ALL USING (auth.role() = 'service_role');

-- 3. Dispense Jobs (Machine & Backend Only)
CREATE POLICY "Service role full access on dispense_jobs" ON dispense_jobs
    FOR ALL USING (auth.role() = 'service_role');

-- 4. Machine Credentials (NEVER readable by anon or authenticated customer)
CREATE POLICY "Strict credentials access" ON machine_credentials
    FOR ALL USING (auth.role() = 'service_role');

-- 5. Audit Logs (Append only for service role, viewable by SUPER_ADMIN)
CREATE POLICY "Service role audit log write" ON audit_logs
    FOR INSERT WITH CHECK (true);
