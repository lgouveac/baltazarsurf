-- Proposta do Henry (pedido BC-20261013-2431): duas Thruster 5'8", entrega em São Paulo.
-- Nome e contato vêm do próprio pedido (não ficam no repositório).
-- Preço: tabela até 6'3" = R$ 2.600 cada; cupom CARBON1000 = 10%; frete estimado R$ 350.
insert into public.proposals (lead_pedido, cliente_nome, cliente_contato, modelo, imagem, detalhes, tamanho, medidas,
  pintura, quilhas, observacoes, preco_tabela, cupom, desconto_pct, frete, frete_desc, preco_final, status,
  escolhe_cores, escolhe_quilhas, itens)
select l.pedido, initcap(lower(l.nome)), l.contato,
  '2 pranchas Thruster 5''8"', 'https://eylnwwerbssfaaaxsccw.supabase.co/storage/v1/object/public/boards/IMG_6846.jpeg',
  'Duas Thruster 5''8", uma de cada referência que você escolheu.', '5''8" (as duas)', '19 1/4 x 2 3/8, 26 L',
  'Você escolhe (logo abaixo)', 'Thruster · FCS II, como você pediu (confirma logo abaixo)',
  'Medidas suas: 176 cm, 73 kg, nível intermediário, onda média. Os 26 litros que você pediu batem com esse perfil; o César confere o volume final na hora de shapear.',
  5200, 'CARBON1000', 10, 350,
  'Entrega em São Paulo (SP), porta a porta, as duas pranchas embaladas juntas. Valor estimado: a gente confirma a cotação antes de enviar o link de pagamento.',
  4680 + 350, 'enviada', true, true,
  jsonb_build_array(
    jsonb_build_object(
      'modelo', 'Thruster 5''8" Squash Tail',
      'imagem', 'https://eylnwwerbssfaaaxsccw.supabase.co/storage/v1/object/public/boards/IMG_6846.jpeg',
      'detalhes', 'Na foto, a referência que você escolheu.',
      'tamanho', '5''8"', 'medidas', '19 1/4 x 2 3/8, 26 L',
      'pintura', 'Linha preta na borda, com desenhos na prancha (detalhe logo abaixo)',
      'quilhas', 'Thruster · FCS II',
      'preco_tabela', 2600, 'pre_quilha', 'Thruster', 'pre_sistema', 'FCS II',
      'pre_cores', 'Linha preta na borda, com uns desenhos daora na prancha.'),
    jsonb_build_object(
      'modelo', 'Thruster 5''8" High Performance',
      'imagem', 'https://eylnwwerbssfaaaxsccw.supabase.co/storage/v1/object/public/boards/baltz-002.jpeg',
      'detalhes', 'Na foto, a referência que você escolheu.',
      'tamanho', '5''8"', 'medidas', '19 1/4 x 2 3/8, 26 L',
      'pintura', 'Você deixou com o shaper: uma arte bonita, com desenhos',
      'quilhas', 'Thruster · FCS II',
      'observacoes', 'Você pediu: "queria uma prancha bonita, com uns desenhos legais".',
      'preco_tabela', 2600, 'pre_quilha', 'Thruster', 'pre_sistema', 'FCS II',
      'pre_cores', '')
  )
from public.leads l
where l.pedido = 'BC-20261013-2431'
  and not exists (select 1 from public.proposals p where p.lead_pedido = 'BC-20261013-2431');

-- Só o token (id) da proposta, pra montar o link.
select id from public.proposals where lead_pedido = 'BC-20261013-2431';
