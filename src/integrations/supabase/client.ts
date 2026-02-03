import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jlakldegvxypuhpxuhoc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsYWtsZGVndnh5cHVocHh1aG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTYzMjMsImV4cCI6MjA4NTY3MjMyM30.53wWTISc0ItLcrEZzLlU69-EE4qbCSzmZId8AhTEF_s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
