-- Proposta do Eduardo: Thruster como recomendado + pergunta FCS II ou Futures.
update public.proposals
   set quilhas = 'Thruster (recomendado). Você confirma logo abaixo e escolhe FCS II ou Futures',
       updated_at = now()
 where id = 'd323316e-1616-48ec-95e8-f57570aecbba';
notify pgrst, 'reload schema';
