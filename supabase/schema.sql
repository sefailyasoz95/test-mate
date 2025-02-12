-- Drop existing types if they exist
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS package_type CASCADE;
DROP TYPE IF EXISTS tester_status CASCADE;

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired');
CREATE TYPE package_type AS ENUM ('single_tester', 'full_package', 'light_test', 'deep_test');
CREATE TYPE tester_status AS ENUM ('available', 'assigned');

-- Enable Row Level Security
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS tester_accounts CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS apps CASCADE;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  google_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  subscription_status subscription_status DEFAULT 'expired'
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  app_id UUID REFERENCES apps(id) NOT NULL,
  package_type package_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add index for faster lookups
CREATE INDEX purchases_app_id_idx ON purchases(app_id);

-- Add policy for app-specific purchases
CREATE POLICY "Users can view purchases for their apps" 
  ON purchases FOR SELECT 
  USING (
    auth.uid() = user_id AND 
    app_id IN (SELECT id FROM apps WHERE user_id = auth.uid())
  );

-- Create tester_accounts table
CREATE TABLE IF NOT EXISTS tester_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status tester_status DEFAULT 'available',
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  plan_type package_type NOT NULL,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create apps table
CREATE TABLE IF NOT EXISTS apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  package_name TEXT NOT NULL UNIQUE,
  play_store_link TEXT,
  app_review TEXT,
  app_screenshots TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can view assigned testers" ON tester_accounts;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Trigger can create profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own apps" ON apps;
DROP POLICY IF EXISTS "Users can create own apps" ON apps;

-- Create RLS Policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can view own purchases" 
  ON purchases FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view assigned testers" 
  ON tester_accounts FOR SELECT 
  USING (auth.uid() = assigned_to OR assigned_to IS NULL);

CREATE POLICY "Users can view own subscriptions" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Trigger can create profile"
  ON profiles FOR INSERT
  TO PUBLIC;

CREATE POLICY "Users can view own apps" 
  ON apps FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own apps" 
  ON apps FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only" ON public.purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tester_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_user RECORD;
BEGIN
  -- Wait a short time to ensure the auth.users record is committed
  -- This helps prevent race conditions
  SELECT * INTO new_user FROM auth.users WHERE id = NEW.id;
  
  IF new_user IS NULL THEN
    RAISE EXCEPTION 'No auth.users record found for id %', NEW.id;
  END IF;

  INSERT INTO public.profiles (id, email)
  VALUES (
    new_user.id,
    new_user.email
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
