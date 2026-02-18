-- Practice database tables for assignments
-- This file accumulates changes from multiple assignments
-- Add new tables and modifications here as you work through the course

-- Contact form table
CREATE TABLE IF NOT EXISTS contact_form (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table for registration system
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table for role-based access control
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add role_id column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role_id'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN role_id INTEGER REFERENCES roles(id);
    END IF;
END $$;

-- Seed roles (idempotent - safe to run multiple times)
INSERT INTO roles (role_name, role_description) 
VALUES 
    ('user', 'Standard user with basic access'),
    ('admin', 'Administrator with full system access')
ON CONFLICT (role_name) DO NOTHING;

-- Update existing users without a role to default 'user' role
DO $$
DECLARE
    user_role_id INTEGER;
BEGIN
    SELECT id INTO user_role_id FROM roles WHERE role_name = 'user';

    IF user_role_id IS NOT NULL THEN
        UPDATE users 
        SET role_id = user_role_id 
        WHERE role_id IS NULL;
    END IF;
END $$;