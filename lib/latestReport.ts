import { supabaseServer } from "@/lib/supabase/server"

export async function getLatestReport() {
  const supabase = await supabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from("InbodyReport")
    .select("*")
    .eq("userId", user.id)
    .order("date", { ascending: false })
    .limit(1)
    .single()

  if (error) return null

  return data
}
