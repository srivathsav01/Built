import { supabaseServer } from '@/lib/supabase/server';


export async function getCurrentUser() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return user;
}
