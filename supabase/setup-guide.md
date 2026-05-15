# Supabase Setup Guide

## Prerequisites
1. A Supabase account (https://supabase.com)
2. Your project created in Supabase dashboard

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Enter project name: `ai-banking`
4. Set a secure database password
5. Choose a region close to your users
6. Click "Create project"

## Step 2: Run Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Open `supabase/migrations/001_core_schema.sql` from this project
3. Copy and paste the entire contents into the SQL Editor
4. Click **Run** to create all tables, indexes, RLS policies, and triggers
5. Then open `supabase/migrations/002_seed_data.sql`
6. Run it to seed initial data

## Step 3: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Disable "Confirm email" (or keep it if you want email verification)
4. Optionally configure Google, Facebook, or other OAuth providers

## Step 4: Create Storage Buckets

1. Go to **Storage** → **New Bucket**
2. Create bucket: `profile-pictures`
3. Set it to **Public**
4. Add the following policy to allow authenticated users to upload:

```sql
-- Allow users to upload their own profile pictures
CREATE POLICY "Users can upload their profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to profile pictures
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
```

## Step 5: Get Your API Keys

1. Go to **Project Settings** → **API**
2. Copy the **Project URL** (e.g., `https://abc123.supabase.co`)
3. Copy the **anon public key**
4. Copy the **service_role key** (keep this secret - only use on backend)

## Step 6: Configure Environment Variables

### Frontend (.env)
```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### Backend (.env)
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 7: Verify Setup

Run this SQL in Supabase SQL Editor to verify everything is working:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see all 20+ tables listed.
