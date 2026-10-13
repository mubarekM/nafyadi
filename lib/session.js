// Reads the saved login from this browser (instant, no internet needed).
// Only if there is none, it tries once to renew it.
export async function currentUser(supabase) {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.user) return data.session.user;
  const { data: renewed } = await supabase.auth.refreshSession();
  return renewed?.session?.user ?? null;
}
