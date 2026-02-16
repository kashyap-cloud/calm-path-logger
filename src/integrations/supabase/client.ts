import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://amslqaihpbayxbkslqja.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtc2xxYWlocGJheXhia3NscWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDExMDYsImV4cCI6MjA4Njc3NzEwNn0.EA_b0lZBNmPZN5OAM46oWOlFM7o09pc7IwcTNKQrY2Y";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
