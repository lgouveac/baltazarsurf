-- Baltazar Customs — CMS schema
-- Run no SQL editor do Supabase depois de criar o projeto.
-- Ordem: este arquivo cria tabelas, políticas RLS e a função de updated_at.
-- Storage: criar bucket "boards" no painel com "Public bucket = on".

-- ============================================================
-- Extensões
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- Roles
-- Dois papéis: owner (você) e shaper (César). Para já, ambos
-- podem editar pranchas e categorias; owner está pronto pra
-- ganhar permissões extras quando o CMS crescer (copy do site).
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','shaper')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Categorias (slug + display name + ordem)
-- O slug é a chave porque o site filtra por nome/slug.
-- Renomeio o display sem quebrar referências em boards.
-- ============================================================
create table if not exists public.categories (
  slug text primary key,
  name text not null,
  display_order int not null default 0,
  active boolean not null default true
);

-- ============================================================
-- Boards
-- image_path = caminho dentro do bucket "boards"
-- line = tag opcional (ex.: "Carbon Trash"), null pra padrão.
-- sort_order para o admin reordenar via drag-and-drop.
-- ============================================================
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  category_slug text references public.categories(slug) on update cascade on delete set null,
  fin_setup text,
  line text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists boards_category_idx on public.boards(category_slug);
create index if not exists boards_active_sort_idx on public.boards(active, sort_order);
create index if not exists boards_line_idx on public.boards(line) where line is not null;

-- ============================================================
-- updated_at automático
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists boards_set_updated_at on public.boards;
create trigger boards_set_updated_at
  before update on public.boards
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS — leitura pública, escrita só pra usuários com perfil
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.categories enable row level security;
alter table public.boards    enable row level security;

-- profiles: cada usuário lê o próprio perfil
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (auth.uid() = id);

-- categories: público lê as ativas; owner/shaper escrevem tudo
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (active = true);

drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  );

-- boards: público lê as ativas; owner/shaper escrevem tudo
drop policy if exists boards_public_read on public.boards;
create policy boards_public_read on public.boards
  for select using (active = true);

drop policy if exists boards_admin_all on public.boards;
create policy boards_admin_all on public.boards
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  );

-- ============================================================
-- Storage policies (rodar depois de criar o bucket "boards")
-- Bucket marcado como público resolve a leitura.
-- Para uploads autenticados, garantir que o bucket aceita usuários
-- com perfil owner/shaper:
-- ============================================================
-- INSERT no storage.objects:
-- create policy "boards upload by admins" on storage.objects
--   for insert to authenticated with check (
--     bucket_id = 'boards'
--     and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
--   );
-- UPDATE:
-- create policy "boards update by admins" on storage.objects
--   for update to authenticated using (
--     bucket_id = 'boards'
--     and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
--   );
-- DELETE:
-- create policy "boards delete by admins" on storage.objects
--   for delete to authenticated using (
--     bucket_id = 'boards'
--     and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
--   );

-- ============================================================
-- Seed das categorias atuais
-- ============================================================
insert into public.categories (slug, name, display_order) values
  ('thruster',    'Thruster',    1),
  ('twin',        'Twin',        2),
  ('twin-plus-1', 'Twin +1',     3),
  ('quad',        'Quad',        4),
  ('mid-length',  'Mid-Length',  5),
  ('longboard',   'Longboard',   6),
  ('asymmetric',  'Asymmetric',  7),
  ('outras',      'Outras',      8)
on conflict (slug) do nothing;
