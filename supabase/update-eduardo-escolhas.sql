-- Proposta do Eduardo (BC-20261011-8432): ele escolhe cores e quilhas na página.
update public.proposals
   set escolhe_cores = true,
       escolhe_quilhas = true,
       pintura = 'Você escolhe as cores (logo abaixo)',
       quilhas = 'Você escolhe (logo abaixo, com a diferença entre elas)'
 where id = 'd323316e-1616-48ec-95e8-f57570aecbba';

notify pgrst, 'reload schema';
