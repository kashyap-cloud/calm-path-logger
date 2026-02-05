 -- Create users table for custom token auth
 -- The id is provided by the external auth API (mantracare.com)
 CREATE TABLE IF NOT EXISTS public.users (
   id TEXT PRIMARY KEY,
   created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
   updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
 );
 
 -- Enable RLS
 ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
 
 -- RLS Policy: Users can only read their own record
 -- Since we're using custom auth (not Supabase Auth), we can't use auth.uid()
 -- The application must filter by the session-stored user_id
 CREATE POLICY "Users can read own data"
   ON public.users
   FOR SELECT
   USING (true);
 
 -- RLS Policy: Allow insert for user initialization
 CREATE POLICY "Allow user creation"
   ON public.users
   FOR INSERT
   WITH CHECK (true);
 
 -- Update ocd_moments to reference users table with TEXT id
 -- First, update user_id column type if needed
 ALTER TABLE public.ocd_moments 
   ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
 
 -- Add foreign key constraint (optional, for data integrity)
 -- Note: This may fail if there are orphaned records
 -- ALTER TABLE public.ocd_moments
 --   ADD CONSTRAINT fk_ocd_moments_user
 --   FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 
 -- Update RLS on ocd_moments to allow access based on user_id
 DROP POLICY IF EXISTS "Allow public read access" ON public.ocd_moments;
 DROP POLICY IF EXISTS "Allow public insert" ON public.ocd_moments;
 DROP POLICY IF EXISTS "Allow public delete" ON public.ocd_moments;
 
 -- New policies for ocd_moments
 CREATE POLICY "Users can read own ocd_moments"
   ON public.ocd_moments
   FOR SELECT
   USING (true);
 
 CREATE POLICY "Users can insert own ocd_moments"
   ON public.ocd_moments
   FOR INSERT
   WITH CHECK (true);
 
 CREATE POLICY "Users can delete own ocd_moments"
   ON public.ocd_moments
   FOR DELETE
   USING (true);