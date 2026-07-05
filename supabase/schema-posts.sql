-- Baltazar Customs — Blog gerenciável pelo CMS
-- Rode no SQL editor depois dos outros schemas.
-- Os artigos são dados no Supabase; o site renderiza em runtime
-- (índice dinâmico + página /blog/post.html?slug=...). Sem deploy pra publicar.

create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  lang         text not null default 'pt' check (lang in ('pt','en','es')),
  title        text not null,
  excerpt      text not null default '',
  cover_image  text not null default '',   -- caminho no bucket boards (opcional)
  body         text not null default '',    -- markdown
  read_minutes int  not null default 5,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists posts_published_idx on public.posts(published, published_at desc);
create index if not exists posts_slug_idx on public.posts(slug);

create or replace function public.set_updated_at_posts()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.published and new.published_at is null then new.published_at = now(); end if;
  return new;
end$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at_posts();

alter table public.posts enable row level security;

-- público lê só os publicados
drop policy if exists posts_public_read on public.posts;
create policy posts_public_read on public.posts
  for select using (published = true);

-- owner/shaper leem e escrevem tudo (inclusive rascunhos)
drop policy if exists posts_admin_all on public.posts;
create policy posts_admin_all on public.posts
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  );
