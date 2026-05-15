-- ============================================================
-- Seed Data for AI Banking Platform
-- Run AFTER 001_core_schema.sql in Supabase SQL Editor
-- ============================================================

-- Seed investment types
INSERT INTO public.investment_types (name, description, minimum_amount, expected_return, risk_level) VALUES
  ('Fixed Deposit', 'Low-risk fixed term deposit with guaranteed returns', 100000.00, 8.00, 'low'),
  ('Treasury Bills', 'Government-backed short-term securities', 50000.00, 10.00, 'low'),
  ('Corporate Bonds', 'Investment in corporate debt instruments', 200000.00, 12.00, 'medium'),
  ('Mutual Funds', 'Diversified portfolio managed by professionals', 50000.00, 15.00, 'medium'),
  ('Real Estate Trust', 'Investment in property portfolios', 500000.00, 18.00, 'medium'),
  ('Stock Market', 'Direct equity investment in listed companies', 100000.00, 22.00, 'high'),
  ('Venture Capital', 'High-risk investment in startups', 1000000.00, 30.00, 'high');

-- Seed payment categories
INSERT INTO public.payment_categories (name, icon) VALUES
  ('Utilities', 'zap'),
  ('Airtime', 'phone'),
  ('Internet', 'wifi'),
  ('Insurance', 'shield'),
  ('Education', 'book'),
  ('Healthcare', 'heart'),
  ('Government', 'building'),
  ('Entertainment', 'tv');

-- Create demo admin user reference (run after user is created via Supabase Auth)
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@aibanking.com';
