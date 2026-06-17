# Supabase CMS — setup

Passo a passo de quando você criar a conta no Supabase.

## 1. Criar projeto

- Painel do Supabase → "New project"
- Region: `sa-east-1` (São Paulo, mais perto do RJ)
- Anota a `Project URL` e a `anon public key` (depois entram no JS)

## 2. Rodar o schema

- SQL Editor → cola o conteúdo de `schema.sql` → Run
- Cria tabelas `profiles`, `categories`, `boards`, RLS, triggers, e popula as 8 categorias.

## 3. Criar o bucket de imagens

- Storage → New bucket → nome `boards`
- Marca "Public bucket" (deixa a leitura pública; uploads ficam protegidos pelas policies do schema)
- Depois cola no SQL Editor as 3 policies de Storage que estão comentadas no fim do `schema.sql`

## 4. Criar os usuários

- Authentication → Users → "Add user" (Send invite)
  - Adiciona o seu email (você vira `owner`)
  - Adiciona o email do César (vira `shaper`)
- SQL Editor (uma vez por usuário, depois que ele logar a primeira vez):

```sql
insert into public.profiles (id, role)
values ('<UUID-do-seu-user>', 'owner');

insert into public.profiles (id, role)
values ('<UUID-do-cesar>', 'shaper');
```

(o UUID aparece na tabela `auth.users` do Supabase)

## 5. Me passar URL + anon key

Manda os dois aqui:

- `SUPABASE_URL=https://xxxx.supabase.co`
- `SUPABASE_ANON_KEY=eyJ...` (a anon key, NÃO a service_role)

A anon key é pública (vai no JS do navegador) — sem problema.

## 6. Próximos passos (eu faço)

- (a) Subir as imagens atuais (`images/baltazar/*` + as `IMG_*` da galeria) pro bucket `boards` via script
- (b) Inserir registros das pranchas em `public.boards` apontando pras imagens do bucket
- (c) Trocar o array hardcoded de pranchas no `index.html` por um fetch ao Supabase
- (d) Criar `/admin` com login magic link + UI de upload/edição
- (e) Setar variáveis de ambiente no Vercel e conectar com o GitHub

## Observações

- A anon key + RLS público read são seguros: ninguém consegue alterar dados sem ser `owner` ou `shaper` autenticados.
- Pra adicionar uma terceira pessoa no admin depois, basta criar o usuário e inserir um perfil com `role='shaper'` ou `'owner'`.
- O `role` controla escrita; pra granularidade fina (ex.: César só edita pranchas, você edita também copy do site no futuro), os checks de cada policy mudam. O schema atual deixa os dois com poderes iguais sobre `categories` e `boards`, que é o que você pediu pra fase 1.
