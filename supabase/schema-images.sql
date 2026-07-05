-- Baltazar Customs — CMS de imagens de seção
-- Rode no SQL editor depois de schema.sql e schema-texts.sql.
-- Mesma ideia dos textos: o HTML tem a imagem padrão; se houver override
-- nesta tabela para o "slot", o site troca a imagem em runtime.
-- As imagens são guardadas no MESMO bucket público "boards".

create table if not exists public.site_images (
  id         uuid primary key default gen_random_uuid(),
  slot       text not null,          -- 'hero' | 'action' | 'nova_geracao' | 'cesar' | 'carbon_feature'
  sort_order int  not null default 0,
  image_path text not null,          -- caminho dentro do bucket boards
  created_at timestamptz not null default now()
);

create index if not exists site_images_slot_idx on public.site_images(slot, sort_order);

alter table public.site_images enable row level security;

drop policy if exists site_images_public_read on public.site_images;
create policy site_images_public_read on public.site_images
  for select using (true);

drop policy if exists site_images_admin_all on public.site_images;
create policy site_images_admin_all on public.site_images
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  ) with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper'))
  );
