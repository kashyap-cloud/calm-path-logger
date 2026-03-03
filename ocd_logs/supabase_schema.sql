-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS ocd_moments CASCADE;
DROP TABLE IF EXISTS daily_interference CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table (using TEXT for ID to support custom external IDs)
CREATE TABLE users (
    id BIGINT PRIMARY KEY,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ocd_moments table
CREATE TABLE ocd_moments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, 
    location TEXT NOT NULL,
    urge TEXT NOT NULL,
    response_type TEXT NOT NULL CHECK (response_type IN ('acted', 'waited', 'noticed_without_acting')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    custom_location TEXT
);

-- Performance index for weekly insights
CREATE INDEX idx_ocd_moments_user_date ON ocd_moments(user_id, created_at);

-- Create daily_interference table
CREATE TABLE daily_interference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    work_study INTEGER CHECK (work_study >= 0 AND work_study <= 10),
    relationships_social INTEGER CHECK (relationships_social >= 0 AND relationships_social <= 10),
    sleep_routine INTEGER CHECK (sleep_routine >= 0 AND sleep_routine <= 10),
    self_care INTEGER CHECK (self_care >= 0 AND self_care <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance index for daily life reporting
CREATE INDEX idx_daily_interference_user_date ON daily_interference(user_id, date);

-- Note: Since the app uses an unauthenticated Supabase client (Anon Key) 
-- with a custom token provider, standard RLS using auth.uid() will not work.
-- For now, we allow all operations for testing. In production, security 
-- should be handled via Supabase Auth or custom JWT claims.

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE ocd_moments DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_interference DISABLE ROW LEVEL SECURITY;