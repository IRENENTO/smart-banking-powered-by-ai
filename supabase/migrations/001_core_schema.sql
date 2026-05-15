-- ============================================================
-- AI Banking Platform - Supabase PostgreSQL Migration
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(500),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  pin_set BOOLEAN DEFAULT FALSE,
  otp_code VARCHAR(6),
  otp_expires_at TIMESTAMPTZ,
  balance DECIMAL(18,2) DEFAULT 0.00,
  account_number VARCHAR(20) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_account_number ON public.users(account_number);
CREATE INDEX idx_users_auth_id ON public.users(auth_id);

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  address TEXT,
  national_id VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. User Security
CREATE TABLE IF NOT EXISTS public.user_security (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_pin VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('deposit','withdrawal','transfer','payment','loan_disbursement','loan_repayment','savings_contribution')),
  amount DECIMAL(18,2) NOT NULL,
  description VARCHAR(500),
  reference_number VARCHAR(100) UNIQUE,
  recipient_account_number VARCHAR(20),
  recipient_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending','completed','failed','cancelled')),
  balance_before DECIMAL(18,2),
  balance_after DECIMAL(18,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX idx_transactions_reference ON public.transactions(reference_number);

-- 5. Loans
CREATE TABLE IF NOT EXISTS public.loans (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(18,2) NOT NULL,
  purpose VARCHAR(500),
  duration INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','approved','disbursed','rejected','completed','defaulted')),
  risk_score DECIMAL(5,2),
  monthly_income DECIMAL(18,2),
  existing_debt DECIMAL(18,2),
  ai_decision TEXT,
  interest_rate DECIMAL(5,2) DEFAULT 10.00,
  total_amount DECIMAL(18,2),
  deduction_amount DECIMAL(15,2),
  deduction_period VARCHAR(20) CHECK (deduction_period IN ('daily','weekly','monthly')),
  paid_amount DECIMAL(15,2) DEFAULT 0.00,
  next_deduction_date DATE,
  extensions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_loans_status ON public.loans(status);
CREATE INDEX idx_loans_risk_score ON public.loans(risk_score);

-- 6. Loan Repayments
CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  loan_id INT NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  amount DECIMAL(18,2) NOT NULL,
  payment_date DATE DEFAULT CURRENT_DATE,
  method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loan_repayments_loan_id ON public.loan_repayments(loan_id);

-- 7. Savings Goals
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(18,2) NOT NULL,
  current_amount DECIMAL(18,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
  auto_deduction_amount DECIMAL(15,2),
  auto_deduction_period VARCHAR(20) CHECK (auto_deduction_period IN ('daily','weekly','monthly')),
  last_deduction_date DATE,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_savings_goals_user_id ON public.savings_goals(user_id);

-- 8. Payment Schedules
CREATE TABLE IF NOT EXISTS public.payment_schedules (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  recipient_type VARCHAR(20) DEFAULT 'account' CHECK (recipient_type IN ('phone','account')),
  recipient_value VARCHAR(50) NOT NULL DEFAULT '',
  amount DECIMAL(18,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily','weekly','monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_payment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','paused','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_schedules_user_id ON public.payment_schedules(user_id);
CREATE INDEX idx_payment_schedules_status ON public.payment_schedules(status);
CREATE INDEX idx_payment_schedules_next_payment ON public.payment_schedules(next_payment_date);

-- 9. AI Insights
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_is_read ON public.ai_insights(is_read);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- 11. Beneficiaries
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  account_number VARCHAR(20),
  phone VARCHAR(20),
  bank_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_beneficiaries_user_id ON public.beneficiaries(user_id);

-- 12. Cards
CREATE TABLE IF NOT EXISTS public.cards (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  card_number VARCHAR(20) NOT NULL UNIQUE,
  card_type VARCHAR(50),
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cards_user_id ON public.cards(user_id);

-- 13. Investments
CREATE TABLE IF NOT EXISTS public.investments (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  returns DECIMAL(18,2) DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investments_user_id ON public.investments(user_id);

-- 14. Investment Types
CREATE TABLE IF NOT EXISTS public.investment_types (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  minimum_amount DECIMAL(18,2) DEFAULT 0,
  expected_return DECIMAL(5,2),
  risk_level VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Security Settings
CREATE TABLE IF NOT EXISTS public.security_settings (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  login_alerts BOOLEAN DEFAULT TRUE,
  transaction_alerts BOOLEAN DEFAULT TRUE,
  two_factor_auth BOOLEAN DEFAULT FALSE,
  session_timeout INT DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 16. Notification Settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 17. Transaction Limits
CREATE TABLE IF NOT EXISTS public.transaction_limits (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  daily_limit DECIMAL(18,2) DEFAULT 1000000.00,
  single_transaction_limit DECIMAL(18,2) DEFAULT 500000.00,
  monthly_limit DECIMAL(18,2) DEFAULT 5000000.00,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 18. User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(10) DEFAULT 'RWF',
  theme VARCHAR(10) DEFAULT 'light',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 19. Payments (Paypack integration)
CREATE TABLE IF NOT EXISTS public.payments (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payment_type VARCHAR(50) NOT NULL,
  provider VARCHAR(50),
  amount DECIMAL(18,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  provider_reference VARCHAR(255),
  transaction_reference VARCHAR(100) UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- 20. Payment Methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  method_type VARCHAR(50) NOT NULL,
  provider_name VARCHAR(100),
  account_identifier VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. Payment Categories
CREATE TABLE IF NOT EXISTS public.payment_categories (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_type VARCHAR(50) DEFAULT 'savings',
  account_number VARCHAR(50) UNIQUE,
  balance DECIMAL(18,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'RWF',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);

-- 23. Admin Users
CREATE TABLE IF NOT EXISTS public.admin_users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin','super_admin','moderator')),
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Functions & Triggers
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_schedules_updated_at BEFORE UPDATE ON public.payment_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate account number for new users
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TRIGGER AS $$
DECLARE
  new_account_number VARCHAR(20);
  counter INT := 0;
BEGIN
  LOOP
    new_account_number := 'ACC' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE account_number = new_account_number) THEN
      NEW.account_number := new_account_number;
      EXIT;
    END IF;
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique account number';
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_account_number_trigger
  BEFORE INSERT ON public.users
  FOR EACH ROW
  WHEN (NEW.account_number IS NULL)
  EXECUTE FUNCTION public.generate_account_number();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY user_isolation ON public.users
  FOR ALL USING (auth.uid() = auth_id);

CREATE POLICY user_profile_isolation ON public.user_profiles
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_transactions_isolation ON public.transactions
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_loans_isolation ON public.loans
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_savings_isolation ON public.savings_goals
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_schedules_isolation ON public.payment_schedules
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_insights_isolation ON public.ai_insights
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_notifications_isolation ON public.notifications
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_investments_isolation ON public.investments
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_security_isolation ON public.user_security
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_settings_isolation ON public.security_settings
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_notification_settings_isolation ON public.notification_settings
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_limits_isolation ON public.transaction_limits
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY user_preferences_isolation ON public.user_preferences
  FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));
