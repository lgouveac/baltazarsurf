# Supabase CMS — setup

Passo a passo de quando você criar a conta no Supabase.

## 1. Criar projeto

- Painel do Supabase → "New project"
- Region: `sa-east-1` (São Paulo, mais perto do RJ)
- Anota a `Project URL` e a `anon public key` (depois entram no JS)

## 2. Rodar o schema

- SQL Editor → cola o conteúdo de `schema.sql` → Run
- Cria tabelas `profiles`, `categories`, `boards`, RLS, triggers, e popula as 8 categorias.
- **Depois** cola e roda `schema-texts.sql` (tabela `site_texts` — CMS de textos), `schema-images.sql` (tabela `site_images` — CMS de imagens de seção) e `schema-posts.sql` (tabela `posts` — blog), todos com RLS.
- Rode também uma vez, pra permitir o upsert do migrate e do admin:
  ```sql
  alter table public.boards add constraint boards_image_path_unique unique (image_path);
  ```

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

## 6. O que o CMS (/admin) edita

Depois de logado (owner ou shaper), o painel tem três abas:

- **Pranchas** — adicionar/editar/excluir prancha, trocar imagem, categoria, quilhas, linha (Carbon Trash), ativar/desativar.
- **Categorias** — criar, renomear, reordenar (setas), ativar/desativar e excluir categorias. Reflete nos filtros do site.
- **Textos** — editar os textos do site (hero, coleção, Carbon Trash, Como Funciona, Sobre o Shaper, nova geração, **FAQ** e frase de fechamento) em **PT / EN / ES**. Campo vazio = usa o texto padrão do site.
- **Imagens** — trocar as fotos de cada seção: hero (5), destaque Carbon Trash (1), foto do César (1), grade "Na Água" (8) e "a nova geração" (2). Sem envio, usa a imagem padrão.
- **Blog** — criar/editar/excluir artigos (título, slug, resumo, imagem de capa, conteúdo em Markdown, minutos de leitura, idioma, publicado sim/não). Artigos publicados aparecem em `/blog/` e abrem em `/blog/post?slug=...` — sem precisar de deploy.

As mudanças aparecem no site ao recarregar a página.

> Textos = elementos com `data-cms="..."`; imagens = elementos com `data-cms-img="slot"`.
> Pra tornar mais coisas editáveis: adicione o atributo no elemento, rode
> `python3 scripts/build-i18n.py` (propaga pro /en e /es), e adicione a entrada
> em `TEXT_SCHEMA` ou `IMAGE_SLOTS` no `admin/index.html`.

## Observações

- A anon key + RLS público read são seguros: ninguém consegue alterar dados sem ser `owner` ou `shaper` autenticados.
- Pra adicionar uma terceira pessoa no admin depois, basta criar o usuário e inserir um perfil com `role='shaper'` ou `'owner'`.
- O `role` controla escrita; pra granularidade fina (ex.: César só edita pranchas, você edita também copy do site no futuro), os checks de cada policy mudam. O schema atual deixa os dois com poderes iguais sobre `categories` e `boards`, que é o que você pediu pra fase 1.
