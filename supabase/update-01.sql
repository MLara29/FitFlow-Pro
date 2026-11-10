-- FitFlow Pro, atualização 01: rode uma vez no SQL Editor do Supabase.
-- Exclusão de conta pelo próprio usuário (exigida pelas lojas de apps).
-- Apagar o usuário remove em cascata o perfil, os planos e o histórico.
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = (select auth.uid());
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
