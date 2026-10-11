-- Baltazar Customs: pedidos do site e propostas para o cliente aprovar.
-- Rode UMA vez no SQL Editor do Supabase. Pode rodar de novo sem estragar nada.
--
-- leads      = cada pedido enviado pelo formulário do site (salvo pelo /api/lead,
--              além do email). Só o admin lê.
-- proposals  = a proposta final que o shaper monta a partir do pedido. O id é o
--              token do link que vai pro cliente (/proposta?t=<id>). O cliente
--              não lê a tabela: só acessa a proposta dele pelas funções abaixo.

-- ---------------------------------------------------------------- leads
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  pedido      text unique,
  created_at  timestamptz not null default now(),
  nome        text,
  contato     text,
  modelo      text,
  altura      text,
  peso        text,
  nivel       text,
  onda        text,
  mensagem    text,
  cupom       text,
  referencias jsonb not null default '[]'::jsonb,
  origem      text
);
alter table public.leads enable row level security;

drop policy if exists leads_insert_site on public.leads;
create policy leads_insert_site on public.leads
  for insert to anon, authenticated with check (true);          -- o site só grava, nunca lê

drop policy if exists leads_admin_all on public.leads;
create policy leads_admin_all on public.leads
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper')));

-- ---------------------------------------------------------------- proposals
create table if not exists public.proposals (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  lead_pedido      text,
  cliente_nome     text not null,
  cliente_contato  text,
  lang             text not null default 'pt' check (lang in ('pt','en','es')),
  modelo           text not null,
  imagem           text not null default '',
  detalhes         text not null default '',
  tamanho          text,
  medidas          text,
  pintura          text,
  quilhas          text,
  observacoes      text,
  nota_shaper      text,
  preco_tabela     integer not null,
  cupom            text,
  desconto_pct     integer not null default 0 check (desconto_pct between 0 and 100),
  preco_final      integer not null,
  prazo            text,
  status           text not null default 'enviada' check (status in ('rascunho','enviada','aceita','cancelada')),
  aceito_em        timestamptz,
  aceito_nome      text
);
alter table public.proposals enable row level security;

drop policy if exists proposals_admin_all on public.proposals;
create policy proposals_admin_all on public.proposals
  for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','shaper')));

create or replace function public.touch_proposals() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists proposals_touch on public.proposals;
create trigger proposals_touch before update on public.proposals for each row execute function public.touch_proposals();

-- O cliente vê a proposta dele pelo token, e só ela.
create or replace function public.get_proposal(t uuid)
returns setof public.proposals language sql security definer set search_path = public as $$
  select * from public.proposals where id = t and status in ('enviada','aceita');
$$;

-- "De acordo": registra uma vez (aceitar de novo não muda data nem nome).
create or replace function public.accept_proposal(t uuid, nome text)
returns setof public.proposals language sql security definer set search_path = public as $$
  update public.proposals
     set status = 'aceita',
         aceito_em = coalesce(aceito_em, now()),
         aceito_nome = coalesce(aceito_nome, left(nullif(trim(nome), ''), 120))
   where id = t and status in ('enviada','aceita')
  returning *;
$$;

revoke all on function public.get_proposal(uuid) from public;
revoke all on function public.accept_proposal(uuid, text) from public;
grant execute on function public.get_proposal(uuid) to anon, authenticated;
grant execute on function public.accept_proposal(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------- Eduardo (BC-20261011-8432)
insert into public.leads (pedido, created_at, nome, contato, altura, peso, nivel, mensagem, cupom, origem)
values ('BC-20261011-8432', '2026-10-11 17:31:00-03', 'Eduardo', '21995630013', '182', '105', 'Iniciante',
        'Acredito que a minha prancha ideal seja 8''6" e 100 litros. Mas aceito sugestões',
        'CARBON1000', 'https://www.baltazarcustomssurfboards.com/')
on conflict (pedido) do nothing;

insert into public.proposals (id, lead_pedido, cliente_nome, cliente_contato, modelo, tamanho, medidas, pintura, quilhas,
                              observacoes, nota_shaper, preco_tabela, cupom, desconto_pct, preco_final)
values ('d323316e-1616-48ec-95e8-f57570aecbba', 'BC-20261011-8432', 'Eduardo', '21995630013',
        'Prancha 8''6" sob medida', '8''6"',
        'Volume calculado pelo shaper para 182 cm, 105 kg e nível iniciante',
        'A combinar com o shaper', 'A combinar com o shaper',
        'Você comentou 8''6" e 100 litros. O tamanho fica em 8''6"; a litragem sai das suas medidas.',
        'Não precisa se preocupar com o volume: ele vai estar de acordo com as suas medidas. Vou fazer a sua prancha em 8''6".',
        3600, 'CARBON1000', 10, 3240)
on conflict (id) do nothing;

-- Link da proposta do Eduardo:
-- https://www.baltazarcustomssurfboards.com/proposta?t=d323316e-1616-48ec-95e8-f57570aecbba
