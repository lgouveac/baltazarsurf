-- Baltazar Customs — CMS de textos do site
-- Rode no SQL editor do Supabase depois do schema.sql inicial.
-- Arquitetura: o HTML estático (PT/EN/ES) continua com o texto traduzido
-- (bom pra SEO e como fallback). Esta tabela guarda OVERRIDES que o admin
-- edita; o site aplica em runtime por cima do texto estático. Se a chave
-- não existir ou vier vazia, o site mantém o texto padrão do HTML.

create table if not exists public.site_texts (
  key        text not null,
  lang       text not null check (lang in ('pt','en','es')),
  value      text not null default '',
  updated_at timestamptz not null default now(),
  primary key (key, lang)
);

create or replace function public.set_updated_at_texts()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end$$;

drop trigger if exists site_texts_set_updated_at on public.site_texts;
create trigger site_texts_set_updated_at
  before update on public.site_texts
  for each row execute function public.set_updated_at_texts();

alter table public.site_texts enable row level security;

-- leitura pública (o site precisa ler os overrides)
drop policy if exists site_texts_public_read on public.site_texts;
create policy site_texts_public_read on public.site_texts
  for select using (true);

-- escrita só pra owner/shaper
drop policy if exists site_texts_admin_all on public.site_texts;
create policy site_texts_admin_all on public.site_texts
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  );
