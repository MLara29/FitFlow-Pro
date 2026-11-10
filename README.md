# FitFlow Pro

App de treino mobile-first (React + Vite + TypeScript) com login, onboarding em 9 etapas,
geração automática de plano, registro de séries com cronômetro de descanso e progresso.

## Rodar

```bash
npm install
npm run dev
```

## Banco de dados (Supabase)

1. No painel do Supabase, abra **SQL Editor**, cole o conteúdo de `supabase/schema.sql` e execute.
   Ele cria as tabelas, as regras de acesso (cada pessoa só vê os próprios dados) e os 40 exercícios.
2. Em **Project Settings > API Keys**, copie a chave pública (anon / publishable) para `.env.local`:

   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```

3. Reinicie `npm run dev`.

Sem a chave, o app roda em **modo local** (dados no navegador), útil para desenvolver.
Por padrão o Supabase pede confirmação de e-mail no cadastro; para testar sem isso, desative em
**Authentication > Sign In / Providers > Email > Confirm email**.

## Estrutura

- `src/data/exercises.ts`: catálogo dos 40 exercícios (fonte do seed; `node scripts/gen-schema.mjs` regenera o SQL)
- `src/lib/plan.ts`: gerador de plano (2-3 dias: corpo inteiro; 4: superior/inferior; 5-6: empurrar/puxar/pernas)
- `src/lib/store.ts`: estado do app, autenticação e gravação no Supabase
- `src/screens/`: telas

Tabelas: `profiles` (UserProfile), `exercises`, `workout_plans`, `workout_days`, `workout_logs` e
`workout_sessions` (uma execução de treino: agrupa os logs e marca o treino como concluído).

## GIFs dos exercícios

O design trazia uma única imagem de demonstração, usada em todos os exercícios. Para usar os GIFs reais,
preencha `media_url` na tabela `exercises` com a URL de cada arquivo; eles tocam em loop automaticamente.

## Conta: confirmação, senha e exclusão

- Cadastro e redefinição de senha funcionam por **código digitado no app** (necessário no app de celular, onde
  links de e-mail abrem o navegador). Para o código aparecer nos e-mails, edite os modelos em
  **Authentication > Emails** no Supabase ("Confirm signup" e "Reset password") e inclua `{{ .Token }}`.
- O link de redefinição também funciona na versão web, desde que a **Site URL** do Supabase aponte para o site.
- "Excluir conta" (Perfil) usa a função `delete_my_account`, criada por `supabase/update-01.sql`
  (já incluída em `schema.sql` para instalações novas).

## Android (Capacitor)

O projeto nativo fica em `android/`. Requer Android Studio instalado.

```bash
npm run android        # gera o site e copia para o projeto Android
npm run android:open   # abre no Android Studio para rodar ou gerar o .aab
```

Antes da primeira publicação, troque o `appId` em `capacitor.config.ts` (e o `applicationId`/`namespace` em
`android/app/build.gradle`) pelo seu domínio invertido: ele não pode mudar depois.

## Publicar no GitHub Pages

O Pages está configurado para servir a pasta `docs/` do branch `main`. Para atualizar o site:

```bash
npm run build:pages
git add docs && git commit -m "Atualiza o site" && git push
```

O build usa a URL e a chave pública do Supabase que estiverem em `.env.local`.
