-- Últimos pedidos, pra montar proposta. O repositório é público e o log do
-- Actions também: nome vai só o primeiro, contato só os 4 últimos dígitos.
select json_agg(x) from (
  select l.pedido, l.created_at, split_part(l.nome, ' ', 1) as nome,
         '…' || right(regexp_replace(l.contato, '\D', '', 'g'), 4) as contato_fim,
         l.modelo, l.altura, l.peso, l.nivel, l.onda, l.mensagem, l.origem,
         (select json_agg(json_build_object('modelo', r->>'modelo', 'detalhes', r->>'detalhes', 'imagem', r->>'imagem',
                 'tamanho', r->>'tamanho', 'medidas', r->>'medidas', 'pintura', r->>'pintura', 'quilhas', r->>'quilhas', 'obs', r->>'obs'))
            from jsonb_array_elements(coalesce(l.referencias, '[]'::jsonb)) r) as refs,
         exists (select 1 from public.proposals p where p.lead_pedido = l.pedido) as tem_proposta
    from public.leads l order by l.created_at desc limit 3
) x;
