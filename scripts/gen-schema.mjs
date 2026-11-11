// Gera supabase/schema.sql (tabelas, RLS e os 40 exercícios) a partir de src/data/exercises.ts.
// Uso: node scripts/gen-schema.mjs
import { writeFileSync } from 'node:fs'
import { EXERCISES } from '../src/data/exercises.ts'

const q = (s) => `'${String(s).replace(/'/g, "''")}'`
const rows = EXERCISES.map(
  (e) => `  (${q(e.id)}, ${q(e.name)}, ${q(e.muscleGroup)}, ${q(e.equipment)}, array[${e.instructions.map(q).join(', ')}], ${q(e.mediaUrl)})`,
).join(',\n')

const owned = ['profiles', 'workout_plans', 'workout_days', 'workout_sessions', 'workout_logs']

const sql = `-- FitFlow Pro: esquema do banco. Rode uma vez no SQL Editor do Supabase.
-- Pode ser executado de novo sem perder dados (create if not exists / upsert).

create table if not exists public.exercises (
  id text primary key,
  name text not null,
  muscle_group text not null,
  equipment text not null,
  instructions text[] not null default '{}',
  media_url text not null default ''
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  age int not null,
  sex text not null check (sex in ('masculino', 'feminino', 'outro')),
  weight_kg numeric not null,
  height_cm numeric not null,
  level text not null check (level in ('iniciante', 'intermediario', 'avancado')),
  goal text not null check (goal in ('massa', 'peso', 'manter')),
  days_per_week int not null check (days_per_week between 2 and 6),
  location text not null check (location in ('academia', 'casa')),
  restrictions text[] not null default '{}',
  restrictions_note text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_plans (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  split_type text not null check (split_type in ('corpo-inteiro', 'superior-inferior', 'empurrar-puxar-pernas')),
  active boolean not null default true,
  based_on text not null default '',
  created_at timestamptz not null default now()
);

-- exercises: lista de { exerciseId, sets, reps, restSeconds }
create table if not exists public.workout_days (
  id uuid primary key,
  plan_id uuid not null references public.workout_plans (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  weekday int not null check (weekday between 0 and 6),
  exercises jsonb not null default '[]'
);

create table if not exists public.workout_sessions (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_day_id uuid references public.workout_days (id) on delete set null,
  day_name text not null,
  date date not null,
  started_at timestamptz not null,
  finished_at timestamptz
);

create table if not exists public.workout_logs (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  date timestamptz not null default now(),
  exercise_id text not null references public.exercises (id),
  set_number int not null,
  weight_kg numeric not null,
  reps int not null
);

create index if not exists workout_plans_user on public.workout_plans (user_id);
create index if not exists workout_days_user on public.workout_days (user_id);
create index if not exists workout_sessions_user on public.workout_sessions (user_id, started_at);
create index if not exists workout_logs_user on public.workout_logs (user_id, date);

-- Segurança: cada pessoa só lê e grava as próprias linhas; o catálogo de exercícios é só leitura.
alter table public.exercises enable row level security;
drop policy if exists "exercises_read" on public.exercises;
create policy "exercises_read" on public.exercises for select using (true);

${owned
  .map(
    (t) => `alter table public.${t} enable row level security;
drop policy if exists "${t}_own" on public.${t};
create policy "${t}_own" on public.${t} for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));`,
  )
  .join('\n\n')}

-- Exclusão de conta pelo próprio usuário (exigida pelas lojas de apps).
-- Apagar o usuário remove em cascata o perfil, os planos e o histórico.
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = '' as \$\$
  delete from auth.users where id = (select auth.uid());
\$\$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Os 40 exercícios da Biblioteca. Troque media_url pela URL do GIF de cada um quando tiver os arquivos.
insert into public.exercises (id, name, muscle_group, equipment, instructions, media_url) values
${rows}
on conflict (id) do update set
  name = excluded.name,
  muscle_group = excluded.muscle_group,
  equipment = excluded.equipment,
  instructions = excluded.instructions;
`
writeFileSync(new URL('../supabase/schema.sql', import.meta.url), sql)

// Atualização do catálogo para bancos já criados
const seed = sql.slice(sql.indexOf('insert into public.exercises'))
writeFileSync(
  new URL('../supabase/update-02.sql', import.meta.url),
  `-- FitFlow Pro, atualização 02: catálogo com os ${EXERCISES.length} exercícios. Rode uma vez no SQL Editor do Supabase.
${seed}
-- Exercícios que saíram do catálogo (mantidos se já houver séries registradas neles).
delete from public.exercises e
where e.id not in (${EXERCISES.map((e) => q(e.id)).join(', ')})
  and not exists (select 1 from public.workout_logs l where l.exercise_id = e.id);
`,
)
console.log(`supabase/schema.sql gerado com ${EXERCISES.length} exercícios`)
