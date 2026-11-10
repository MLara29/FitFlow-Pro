-- FitFlow Pro: esquema do banco. Rode uma vez no SQL Editor do Supabase.
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

alter table public.profiles enable row level security;
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter table public.workout_plans enable row level security;
drop policy if exists "workout_plans_own" on public.workout_plans;
create policy "workout_plans_own" on public.workout_plans for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter table public.workout_days enable row level security;
drop policy if exists "workout_days_own" on public.workout_days;
create policy "workout_days_own" on public.workout_days for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter table public.workout_sessions enable row level security;
drop policy if exists "workout_sessions_own" on public.workout_sessions;
create policy "workout_sessions_own" on public.workout_sessions for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter table public.workout_logs enable row level security;
drop policy if exists "workout_logs_own" on public.workout_logs;
create policy "workout_logs_own" on public.workout_logs for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Exclusão de conta pelo próprio usuário (exigida pelas lojas de apps).
-- Apagar o usuário remove em cascata o perfil, os planos e o histórico.
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = (select auth.uid());
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Os 40 exercícios da Biblioteca. Troque media_url pela URL do GIF de cada um quando tiver os arquivos.
insert into public.exercises (id, name, muscle_group, equipment, instructions, media_url) values
  ('supino-reto', 'Supino reto com barra', 'Peito', 'Barra', array['Deite no banco com os pés firmes no chão e segure a barra um pouco além da largura dos ombros.', 'Tire a barra do suporte e desça com controle até tocar o meio do peito.', 'Empurre a barra para cima até estender os cotovelos, sem travar.', 'Mantenha as escápulas juntas e os glúteos apoiados no banco.'], 'media/exercicio-demo.jpg'),
  ('supino-inclinado', 'Supino inclinado com halteres', 'Peito', 'Halteres', array['Ajuste o banco entre 30° e 45° e deite com um halter em cada mão na altura do peito.', 'Empurre os halteres para cima até quase estender os cotovelos.', 'Desça devagar até os halteres ficarem ao lado do peito.', 'Mantenha os punhos alinhados com os cotovelos durante todo o movimento.'], 'media/exercicio-demo.jpg'),
  ('supino-declinado', 'Supino declinado', 'Peito', 'Barra', array['Deite no banco declinado, prenda os pés e segure a barra um pouco além dos ombros.', 'Desça a barra com controle até a parte inferior do peito.', 'Empurre de volta até estender os cotovelos.', 'Peça ajuda para tirar e devolver a barra ao suporte.'], 'media/exercicio-demo.jpg'),
  ('crucifixo', 'Crucifixo com halteres', 'Peito', 'Halteres', array['Deite no banco com os halteres acima do peito e as palmas voltadas uma para a outra.', 'Abra os braços em arco, com os cotovelos levemente flexionados, até sentir alongar o peito.', 'Volte pelo mesmo arco até os halteres quase se tocarem.', 'Não deixe os cotovelos descerem muito abaixo da linha dos ombros.'], 'media/exercicio-demo.jpg'),
  ('crossover', 'Crossover na polia', 'Peito', 'Polia', array['Ajuste as polias no alto, segure uma alça em cada mão e dê um passo à frente.', 'Com o tronco levemente inclinado, traga as mãos para baixo e para a frente até se encontrarem.', 'Segure um instante contraindo o peito.', 'Volte devagar, deixando os braços abrirem até a linha dos ombros.'], 'media/exercicio-demo.jpg'),
  ('flexao', 'Flexão de braço', 'Peito', 'Peso corporal', array['Apoie as mãos no chão um pouco além da largura dos ombros e estenda as pernas.', 'Mantenha o corpo em linha reta, da cabeça aos calcanhares.', 'Desça o peito até perto do chão, com os cotovelos a cerca de 45° do tronco.', 'Empurre o chão até estender os braços.'], 'media/exercicio-demo.jpg'),
  ('barra-fixa', 'Barra fixa', 'Costas', 'Peso corporal', array['Segure a barra com as palmas para a frente, mãos um pouco além dos ombros.', 'Partindo dos braços estendidos, puxe o corpo até o queixo passar da barra.', 'Desça com controle até estender os braços de novo.', 'Evite balançar o corpo para ganhar impulso.'], 'media/exercicio-demo.jpg'),
  ('puxada-frontal', 'Puxada frontal', 'Costas', 'Polia', array['Sente no aparelho, ajuste o apoio das coxas e segure a barra com pegada aberta.', 'Puxe a barra até a parte de cima do peito, levando os cotovelos para baixo e para trás.', 'Volte devagar até estender os braços.', 'Mantenha o tronco firme, com leve inclinação para trás.'], 'media/exercicio-demo.jpg'),
  ('remada-curvada', 'Remada curvada', 'Costas', 'Barra', array['Em pé, segure a barra, flexione levemente os joelhos e incline o tronco à frente com a coluna reta.', 'Puxe a barra em direção ao abdômen, levando os cotovelos para trás.', 'Desça com controle até estender os braços.', 'Não arredonde a lombar nem use impulso do tronco.'], 'media/exercicio-demo.jpg'),
  ('remada-unilateral', 'Remada unilateral', 'Costas', 'Halter', array['Apoie um joelho e a mão do mesmo lado no banco, com a coluna reta.', 'Com o outro braço, puxe o halter até a lateral do tronco.', 'Desça devagar até estender o braço.', 'Complete as repetições e troque de lado.'], 'media/exercicio-demo.jpg'),
  ('remada-baixa', 'Remada baixa', 'Costas', 'Polia', array['Sente no aparelho com os pés apoiados e os joelhos levemente flexionados.', 'Segure o puxador e puxe até o abdômen, aproximando as escápulas.', 'Volte devagar até estender os braços.', 'Mantenha o tronco ereto, sem balançar para trás.'], 'media/exercicio-demo.jpg'),
  ('levantamento-terra', 'Levantamento terra', 'Costas', 'Barra', array['Fique com os pés na largura do quadril e a barra sobre o meio dos pés.', 'Agache, segure a barra e mantenha a coluna reta e o peito aberto.', 'Levante estendendo quadril e joelhos ao mesmo tempo, com a barra rente ao corpo.', 'Desça pelo mesmo caminho, com controle.'], 'media/exercicio-demo.jpg'),
  ('desenvolvimento-halteres', 'Desenvolvimento com halteres', 'Ombros', 'Halteres', array['Sente com as costas apoiadas e um halter em cada mão na altura dos ombros.', 'Empurre os halteres para cima até quase estender os cotovelos.', 'Desça com controle até a altura das orelhas.', 'Mantenha o abdômen firme e não arqueie a lombar.'], 'media/exercicio-demo.jpg'),
  ('desenvolvimento-militar', 'Desenvolvimento militar', 'Ombros', 'Barra', array['Em pé, segure a barra na altura das clavículas, mãos um pouco além dos ombros.', 'Empurre a barra acima da cabeça até estender os braços.', 'Desça devagar até a posição inicial.', 'Contraia abdômen e glúteos para não inclinar o tronco para trás.'], 'media/exercicio-demo.jpg'),
  ('elevacao-lateral', 'Elevação lateral', 'Ombros', 'Halteres', array['Em pé, um halter em cada mão ao lado do corpo.', 'Eleve os braços para os lados até a altura dos ombros, com os cotovelos levemente flexionados.', 'Desça devagar.', 'Não encolha os ombros nem balance o tronco.'], 'media/exercicio-demo.jpg'),
  ('elevacao-frontal', 'Elevação frontal', 'Ombros', 'Halteres', array['Em pé, halteres à frente das coxas, palmas voltadas para o corpo.', 'Eleve os braços à frente até a altura dos ombros.', 'Desça com controle.', 'Mantenha o tronco parado durante todo o movimento.'], 'media/exercicio-demo.jpg'),
  ('crucifixo-inverso', 'Crucifixo inverso', 'Ombros', 'Máquina', array['Sente de frente para o encosto da máquina e segure as alças com os braços estendidos.', 'Abra os braços para trás até a linha dos ombros.', 'Segure um instante, aproximando as escápulas.', 'Volte devagar, sem deixar os pesos baterem.'], 'media/exercicio-demo.jpg'),
  ('rosca-direta', 'Rosca direta', 'Bíceps', 'Barra', array['Em pé, segure a barra com as palmas para cima, mãos na largura dos ombros.', 'Flexione os cotovelos e suba a barra até a altura do peito.', 'Desça devagar até estender os braços.', 'Mantenha os cotovelos junto ao tronco, sem balançar o corpo.'], 'media/exercicio-demo.jpg'),
  ('rosca-alternada', 'Rosca alternada', 'Bíceps', 'Halteres', array['Em pé, um halter em cada mão, braços estendidos ao lado do corpo.', 'Flexione um cotovelo e suba o halter até o ombro, girando a palma para cima.', 'Desça devagar e repita com o outro braço.', 'Mantenha os cotovelos junto ao tronco, sem balançar o corpo.'], 'media/exercicio-demo.jpg'),
  ('rosca-martelo', 'Rosca martelo', 'Bíceps', 'Halteres', array['Em pé, um halter em cada mão, palmas voltadas para o corpo.', 'Flexione os cotovelos e suba os halteres sem girar os punhos.', 'Desça com controle até estender os braços.', 'Mantenha os cotovelos parados ao lado do tronco.'], 'media/exercicio-demo.jpg'),
  ('rosca-scott', 'Rosca Scott', 'Bíceps', 'Máquina', array['Sente na máquina e apoie a parte de trás dos braços no encosto.', 'Segure as alças e flexione os cotovelos até contrair os bíceps.', 'Desça devagar, sem estender totalmente os cotovelos.', 'Não tire os braços do apoio.'], 'media/exercicio-demo.jpg'),
  ('triceps-polia', 'Tríceps na polia', 'Tríceps', 'Polia', array['De frente para a polia alta, segure a barra ou a corda com os cotovelos junto ao tronco.', 'Estenda os cotovelos, empurrando para baixo até os braços ficarem retos.', 'Volte devagar até os antebraços passarem um pouco da horizontal.', 'Mexa só os antebraços; os cotovelos ficam parados.'], 'media/exercicio-demo.jpg'),
  ('triceps-testa', 'Tríceps testa', 'Tríceps', 'Barra W', array['Deite no banco e segure a barra W acima do peito, braços estendidos.', 'Flexione os cotovelos e desça a barra em direção à testa.', 'Estenda os cotovelos para voltar à posição inicial.', 'Mantenha os cotovelos apontados para cima, sem abrir.'], 'media/exercicio-demo.jpg'),
  ('triceps-frances', 'Tríceps francês', 'Tríceps', 'Halter', array['Sentado ou em pé, segure um halter com as duas mãos acima da cabeça.', 'Flexione os cotovelos e desça o halter atrás da cabeça.', 'Estenda os cotovelos até o halter voltar ao alto.', 'Mantenha os cotovelos próximos da cabeça.'], 'media/exercicio-demo.jpg'),
  ('mergulho', 'Mergulho nas paralelas', 'Tríceps', 'Peso corporal', array['Apoie as mãos nas barras e sustente o corpo com os braços estendidos.', 'Desça flexionando os cotovelos até cerca de 90°.', 'Empurre para cima até estender os braços.', 'Mantenha o tronco mais ereto para dar ênfase ao tríceps.'], 'media/exercicio-demo.jpg'),
  ('agachamento-livre', 'Agachamento livre', 'Quadríceps', 'Barra', array['Apoie a barra na parte de cima das costas, pés na largura dos ombros.', 'Desça levando o quadril para trás e flexionando os joelhos, com o peito aberto.', 'Vá até as coxas ficarem paralelas ao chão, ou até onde conseguir manter a postura.', 'Suba empurrando o chão, com os joelhos alinhados aos pés.'], 'media/exercicio-demo.jpg'),
  ('leg-press', 'Leg press 45°', 'Quadríceps', 'Máquina', array['Sente no aparelho com as costas bem apoiadas e os pés na plataforma, na largura dos ombros.', 'Destrave e desça a plataforma flexionando os joelhos até cerca de 90°.', 'Empurre de volta sem travar os joelhos no final.', 'Não deixe o quadril descolar do assento.'], 'media/exercicio-demo.jpg'),
  ('cadeira-extensora', 'Cadeira extensora', 'Quadríceps', 'Máquina', array['Sente com as costas apoiadas e o rolo ajustado sobre os tornozelos.', 'Estenda os joelhos até as pernas ficarem quase retas.', 'Segure um instante e desça devagar.', 'Alinhe os joelhos com o eixo da máquina.'], 'media/exercicio-demo.jpg'),
  ('afundo', 'Afundo', 'Glúteos', 'Halteres', array['Em pé, um halter em cada mão, dê um passo largo à frente.', 'Desça até os dois joelhos formarem cerca de 90°.', 'Empurre o chão com a perna da frente para voltar.', 'Alterne as pernas, com o tronco ereto.'], 'media/exercicio-demo.jpg'),
  ('agachamento-bulgaro', 'Agachamento búlgaro', 'Glúteos', 'Halteres', array['De costas para um banco, apoie o peito de um pé sobre ele e segure os halteres.', 'Desça flexionando o joelho da frente até a coxa ficar paralela ao chão.', 'Suba empurrando o chão com o pé da frente.', 'Complete as repetições e troque de perna.'], 'media/exercicio-demo.jpg'),
  ('elevacao-pelvica', 'Elevação pélvica', 'Glúteos', 'Barra', array['Apoie a parte de cima das costas em um banco, com a barra sobre o quadril.', 'Com os pés firmes no chão, eleve o quadril até alinhar tronco e coxas.', 'Contraia os glúteos no alto por um instante.', 'Desça com controle, sem encostar no chão.'], 'media/exercicio-demo.jpg'),
  ('stiff', 'Stiff com barra', 'Posteriores', 'Barra', array['Em pé, segure a barra à frente das coxas, joelhos levemente flexionados.', 'Leve o quadril para trás e desça a barra rente às pernas, com a coluna reta.', 'Desça até sentir alongar a parte de trás das coxas.', 'Suba contraindo glúteos e posteriores.'], 'media/exercicio-demo.jpg'),
  ('mesa-flexora', 'Mesa flexora', 'Posteriores', 'Máquina', array['Deite de bruços com o rolo apoiado logo acima dos calcanhares.', 'Flexione os joelhos, trazendo o rolo em direção aos glúteos.', 'Desça devagar até quase estender as pernas.', 'Mantenha o quadril encostado no aparelho.'], 'media/exercicio-demo.jpg'),
  ('cadeira-flexora', 'Cadeira flexora', 'Posteriores', 'Máquina', array['Sente com as costas apoiadas e o rolo ajustado atrás dos tornozelos.', 'Flexione os joelhos, puxando o rolo para baixo e para trás.', 'Volte devagar até quase estender as pernas.', 'Use o apoio das coxas para não levantar do assento.'], 'media/exercicio-demo.jpg'),
  ('panturrilha-em-pe', 'Panturrilha em pé', 'Panturrilha', 'Máquina', array['Posicione os ombros sob os apoios e a ponta dos pés na plataforma.', 'Suba o máximo que conseguir na ponta dos pés.', 'Segure um instante no alto.', 'Desça devagar até alongar bem a panturrilha.'], 'media/exercicio-demo.jpg'),
  ('panturrilha-sentado', 'Panturrilha sentado', 'Panturrilha', 'Máquina', array['Sente com os joelhos sob o apoio e a ponta dos pés na plataforma.', 'Eleve os calcanhares o máximo que conseguir.', 'Segure um instante no alto.', 'Desça devagar até alongar a panturrilha.'], 'media/exercicio-demo.jpg'),
  ('prancha', 'Prancha', 'Abdômen', 'Peso corporal', array['Apoie os antebraços e a ponta dos pés no chão.', 'Mantenha o corpo em linha reta, com abdômen e glúteos contraídos.', 'Sustente a posição pelo tempo previsto, respirando normalmente.', 'Não deixe o quadril cair nem subir demais.'], 'media/exercicio-demo.jpg'),
  ('abdominal-supra', 'Abdominal supra', 'Abdômen', 'Peso corporal', array['Deite de costas com os joelhos flexionados e os pés no chão.', 'Com as mãos ao lado da cabeça, tire os ombros do chão contraindo o abdômen.', 'Desça devagar, sem relaxar totalmente.', 'Não puxe o pescoço com as mãos.'], 'media/exercicio-demo.jpg'),
  ('elevacao-pernas', 'Elevação de pernas', 'Abdômen', 'Barra fixa', array['Pendure-se na barra fixa com os braços estendidos.', 'Eleve as pernas até a altura do quadril, ou os joelhos em direção ao peito.', 'Desça devagar, sem balançar.', 'Mantenha o abdômen contraído durante todo o movimento.'], 'media/exercicio-demo.jpg'),
  ('abdominal-polia', 'Abdominal na polia', 'Abdômen', 'Polia', array['Ajoelhe de frente para a polia alta e segure a corda ao lado da cabeça.', 'Flexione o tronco, levando os cotovelos em direção aos joelhos.', 'Volte devagar até o tronco ficar ereto.', 'O movimento vem do abdômen, não dos braços nem do quadril.'], 'media/exercicio-demo.jpg')
on conflict (id) do update set
  name = excluded.name,
  muscle_group = excluded.muscle_group,
  equipment = excluded.equipment,
  instructions = excluded.instructions;
