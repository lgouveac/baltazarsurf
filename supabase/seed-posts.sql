-- Baltazar Customs: 5 artigos de blog otimizados para SEO de venda de prancha
-- Rode UMA vez no SQL editor do Supabase (depois de schema-posts.sql).
-- Idempotente: se rodar de novo, atualiza os artigos pelo slug (on conflict).
-- Os textos usam dollar-quoting ($md$...$md$), então apóstrofos não precisam ser escapados.
-- Depois de rodar, os artigos aparecem sozinhos em /blog/ e o César pode editar tudo pelo /admin.

insert into public.posts (slug, lang, title, excerpt, cover_image, body, read_minutes, published, published_at)
values

-- =========================================================================
-- 1) PREÇO  (intenção comercial altíssima: "quanto custa prancha de surf")
-- =========================================================================
(
  'quanto-custa-prancha-sob-medida',
  'pt',
  $t$Quanto custa uma prancha de surf sob medida em 2026$t$,
  $e$Quanto custa uma prancha de surf artesanal feita sob medida no Brasil, o que entra no preço, por que custa o que custa e como saber se vale a pena para o seu surf.$e$,
  '',
  $md$Toda semana chega a mesma pergunta no WhatsApp: "quanto sai uma prancha sua?". A resposta honesta é que depende, mas não do jeito enrolado que ninguém gosta. Depende de coisas concretas, e dá pra explicar cada uma delas.

Este guia mostra o que entra no preço de uma prancha de surf sob medida, a faixa que você encontra no mercado brasileiro em 2026, e como decidir se o investimento faz sentido pro seu momento.

## A faixa de preço no Brasil em 2026

Uma prancha nova de fábrica, feita em série, costuma sair mais barata porque é produzida em escala, muitas vezes importada e sem nenhum ajuste pra quem vai surfar nela. Uma prancha artesanal, shapeada por encomenda, trabalha em outra lógica: cada uma é única, dimensionada pro seu corpo, seu nível e as ondas que você surfa.

Na prática, o que muda o valor final de uma prancha custom é isto:

- **Tamanho e litragem.** Uma prancha maior gasta mais material, mais resina, mais tempo de laminação.
- **Configuração de quilhas.** Twin, thruster, quad ou quilha única mudam a caixaria e o acabamento.
- **Materiais.** Fibra comum, fibra colorida, deck em carbono ou a tecnologia [Carbon Trash](/carbon-trash) alteram o custo da laminação.
- **Acabamento.** Lixa fosca, brilho, pigmento, resin tint, laminação artística. Cada camada é trabalho manual.
- **Tempo de shape.** Um formato clássico já rodado sai mais rápido do que um projeto do zero, desenhado pra uma onda específica.

## Por que a artesanal custa o que custa

Quando você compra uma prancha de prateleira, paga por um produto pronto. Quando encomenda uma custom, paga por horas de trabalho de uma pessoa que shapeia há anos e por uma prancha que ninguém mais tem igual.

O César passa por cada etapa com a mão: fecha o outline, faz o rocker, puxa os côncavos, lamina, instala as caixas de quilha, lixa e finaliza. Não tem linha de montagem. Tem um shaper e o seu bloco de espuma virando uma prancha só sua.

> Uma prancha bem shapeada pro seu surf te faz evoluir mais rápido do que qualquer prancha cara comprada no chute.

Isso é o ponto que quase ninguém coloca na conta: uma prancha errada, mesmo barata, é dinheiro parado embaixo do braço. Uma prancha certa rema melhor, entra mais cedo na onda e perdoa mais os seus erros. Ela se paga em sessões surfadas.

## O que entra no orçamento que você recebe

Quando você chama pra pedir um orçamento, a conversa cobre:

- Seu peso, altura e há quanto tempo você surfa.
- As ondas onde você surfa na maior parte do tempo.
- A prancha que você usa hoje e o que te incomoda nela.
- O tipo de surf que você quer fazer: remar e pegar volume, soltar manobra, deslizar em onda pequena.

Com isso o César fecha litragem, outline e quilha, e aí sim sai um número fechado, sem surpresa depois. Se você ainda está inseguro sobre o tamanho, o guia de [como escolher a litragem ideal](/blog/litragem-ideal) ajuda a chegar na conversa com uma noção do ponto de partida.

## Vale a pena pra você?

Vale a pena quando você já surfa com alguma regularidade e sente que a prancha atual está segurando sua evolução, ou quando quer uma prancha específica pra um tipo de onda. Não faz tanto sentido pra quem pegou a primeira aula semana passada e ainda não sabe que direção o surf vai tomar.

Se você está nesse ponto de querer uma prancha que conversa com o seu surf, o melhor caminho é conversar. [Chama o shaper no WhatsApp](/), conta seu momento, e receba um orçamento real, feito pra você, sem compromisso.$md$,
  8, true, now()
),

-- =========================================================================
-- 2) COMPARAÇÃO  ("prancha sob medida vs prateleira", "custom vale a pena")
-- =========================================================================
(
  'prancha-sob-medida-vs-prateleira',
  'pt',
  $t$Prancha sob medida ou de prateleira: qual vale mais a pena$t$,
  $e$A diferença real entre uma prancha de surf artesanal sob medida e uma prancha de prateleira feita em série: desempenho, durabilidade, preço e para quem cada uma faz sentido.$e$,
  '',
  $md$Chega uma hora que todo surfista se pergunta isso: compro aquela prancha pronta que está na loja, ou encomendo uma sob medida com um shaper? As duas resolvem, mas resolvem coisas diferentes. Vale entender antes de gastar.

## O que é cada uma

A **prancha de prateleira** é feita em série, num tamanho padrão, pra um surfista genérico. Ela existe pronta, você leva na hora. É produzida em escala, muitas vezes com máquina e importada.

A **prancha sob medida** é shapeada por encomenda pro seu corpo, seu nível e suas ondas. Você não escolhe entre três tamanhos prontos: o tamanho é calculado pra você. Cada uma é única.

## Desempenho: a prancha certa muda o surf

Uma prancha de série é desenhada pra atender a maior quantidade de gente possível. Ela funciona, mas funciona na média. Se você é mais pesado, mais leve, surfa uma onda específica ou tem um estilo próprio, a prancha média vai sempre ficar um pouco fora do ponto.

A sob medida ataca justamente isso. O shaper ajusta litragem, outline, rocker e distribuição de volume pro seu caso. O resultado é uma prancha que rema melhor pra você, entra na onda na hora certa e responde do jeito que você espera. Se ainda tem dúvida entre configurações de quilha, o guia de [thruster, twin ou quad](/blog/thruster-twin-quad) mostra o que cada uma entrega.

> A prancha de série te serve. A prancha sob medida serve você.

## Durabilidade e reparo

Prancha é item de consumo, todas amassam com o uso. A diferença é que uma prancha artesanal feita por um shaper local pode voltar pra mão de quem a fez. Deu um problema, precisa de um reparo, quer um ajuste: você fala com a mesma pessoa que shapeou. Na prateleira, você fica com a etiqueta e o telefone da loja.

Na Baltazar Customs ainda tem a linha [Carbon Trash](/carbon-trash), que reaproveita resíduo de carbono na laminação. Além de ser um projeto mais consciente, entrega um reforço que a prancha de série padrão geralmente não tem.

## Preço: o barato e o certo

A prancha de prateleira costuma ter o preço de entrada mais baixo, e isso é real. Mas o cálculo não termina aí.

- Uma prancha errada some do seu surf em pouco tempo e vira dinheiro parado.
- Uma prancha certa te faz evoluir, dura no seu uso e você não fica trocando toda temporada.

Quando você olha o custo por sessão bem surfada, e não só o preço da etiqueta, a conta muda. Falamos disso em detalhe em [quanto custa uma prancha sob medida](/blog/post?slug=quanto-custa-prancha-sob-medida).

## Pra quem cada uma faz sentido

**Prateleira faz sentido** quando você está começando agora, ainda não sabe que tipo de surf vai fazer, ou quer uma prancha de bater sem se apegar.

**Sob medida faz sentido** quando você já surfa com alguma regularidade, sente a prancha atual te segurando, ou quer uma prancha pensada pra uma onda ou um estilo específico. É o passo de quem parou de aceitar a média.

Se é o seu caso, [conversa com o shaper](/) e conta seu momento. O orçamento é feito pra você, e a prancha também.$md$,
  7, true, now()
),

-- =========================================================================
-- 3) LOCAL / SEO REGIONAL  ("prancha de surf Rio de Janeiro", "shaper Recreio")
-- =========================================================================
(
  'onde-comprar-prancha-surf-rio-de-janeiro',
  'pt',
  $t$Onde comprar prancha de surf no Rio de Janeiro$t$,
  $e$Guia para comprar prancha de surf sob medida no Rio de Janeiro com shaper local no Recreio dos Bandeirantes: como funciona a encomenda, prazos e por que comprar direto de quem shapeia.$e$,
  '',
  $md$Se você surfa no Rio e está procurando uma prancha nova, tem dois caminhos: comprar numa surf shop uma prancha de série, ou encomendar uma prancha sob medida direto com um shaper local. Este guia é sobre o segundo caminho, e por que ele costuma valer mais a pena pra quem surfa aqui.

## Comprar direto de quem shapeia

No Rio de Janeiro existem shapers de verdade, que fazem prancha à mão, e a Baltazar Customs é um deles. O ateliê fica no **Recreio dos Bandeirantes**, na Zona Oeste, do lado das ondas onde a maioria dos clientes surfa.

Comprar direto do shaper muda a experiência inteira:

- Você conversa com a pessoa que vai fazer a sua prancha, não com um vendedor.
- A prancha é dimensionada pro seu corpo, seu nível e as ondas do Rio.
- Se precisar de reparo ou ajuste, você volta pra mesma mão que shapeou.
- Você fortalece o surf local em vez de comprar uma prancha importada de série.

## Feita pras ondas que você surfa

Quem shapeia no Recreio conhece o mar daqui. A onda da Zona Oeste, os dias de Barra e Recreio cheios de gente, os swells de inverno, aquele verão de ondinha fraca que pede mais volume. Uma prancha pensada por alguém que surfa essas mesmas condições sai na frente de uma prancha genérica desenhada pra qualquer lugar do mundo.

Se você surfa mais em ondas pequenas e fracas boa parte do ano, por exemplo, isso muda a litragem e o formato ideal. O guia de [como escolher a litragem ideal](/blog/litragem-ideal) entra nesse detalhe.

## Como funciona a encomenda

O processo é simples e todo por conversa:

1. Você chama no WhatsApp e conta seu peso, altura, tempo de surf e onde costuma surfar.
2. O César sugere litragem, formato e configuração de quilha pro seu caso.
3. Vocês fecham o orçamento e o modelo.
4. A prancha entra na fila de shape e você acompanha até ficar pronta.
5. Você retira no Recreio ou combina a entrega.

Sem intermediário, sem prancha errada empurrada, sem etiqueta genérica.

> Uma prancha feita no Rio, por quem surfa no Rio, pras ondas do Rio.

## E se eu não for do Recreio?

Sem problema. A maior parte da conversa acontece no WhatsApp, então você pode morar em qualquer bairro do Rio, ou fora dele, e ainda assim encomendar. A retirada e a entrega a gente combina. O que importa é a prancha chegar certa na sua mão.

## Comece a conversa

Se você está no Rio e quer uma prancha sob medida, feita à mão por um shaper local, [fala com o César no WhatsApp](/). Conta seu momento e receba uma proposta feita pra você. Dá pra conhecer mais do trabalho e da história dele na página [sobre o shaper](/sobre-cesar).$md$,
  6, true, now()
),

-- =========================================================================
-- 4) PROCESSO / FUNIL  ("como encomendar prancha personalizada")
-- =========================================================================
(
  'como-encomendar-prancha-personalizada',
  'pt',
  $t$Como encomendar sua prancha de surf personalizada: passo a passo$t$,
  $e$O passo a passo para encomendar uma prancha de surf personalizada com shaper: quais informações levar, como é definido o formato, prazos e o que esperar da primeira conversa até a retirada.$e$,
  '',
  $md$Encomendar uma prancha sob medida parece complicado pra quem nunca fez, mas é mais simples do que comprar uma pronta e torcer pra dar certo. Aqui está o caminho completo, do primeiro contato até você embaixo do braço com a prancha na água.

## Antes de chamar: junte essas informações

Quanto mais o shaper souber de você, melhor a prancha sai. Tenha em mãos:

- **Peso e altura.** É a base do cálculo de litragem.
- **Tempo de surf e frequência.** Há quanto tempo você surfa e quantas vezes por semana entra na água.
- **Onde você surfa.** As ondas que você pega na maior parte do tempo.
- **Sua prancha atual.** Medidas se souber, e principalmente o que te agrada e o que te incomoda nela.
- **Seu objetivo.** Remar e pegar mais onda, soltar mais manobra, surfar onda pequena, evoluir de nível.

Se você não tem todos esses dados, tudo bem. O shaper puxa o resto na conversa.

## Passo 1: a conversa inicial

Tudo começa por uma conversa no WhatsApp. Você conta seu momento, o César faz algumas perguntas e já começa a desenhar o caminho: que tipo de prancha faz sentido, que litragem, que configuração de quilha. Se você está em dúvida entre [thruster, twin ou quad](/blog/thruster-twin-quad), é aqui que isso se resolve.

## Passo 2: definição do projeto

Com as informações na mesa, o shaper fecha:

- A **litragem** certa pro seu peso e nível.
- O **outline e o rocker**, que definem como a prancha vira e desliza.
- A **configuração de quilha**.
- O **acabamento**: cor, laminação, e se vai ser na linha [Carbon Trash](/carbon-trash).

Nesse ponto você já sabe exatamente qual prancha vai receber, e o orçamento sai fechado.

## Passo 3: o shape

Aprovado o projeto, a prancha entra na fila e o César começa o trabalho manual: corte do bloco, outline, rocker, côncavos, laminação, instalação das caixas de quilha, lixa e acabamento. É uma prancha nascendo pela mão de quem a desenhou, não saindo de uma esteira.

> Você não escolhe entre o que está pronto. Você desenha, junto com o shaper, o que vai surfar.

## Passo 4: retirada e primeira surfada

Prancha pronta, você retira no Recreio ou combina a entrega. E aí vem a melhor parte, que é sentir na água uma prancha feita pra você. A diferença de uma prancha que conversa com o seu surf aparece já nas primeiras remadas.

## Quanto tempo leva?

O prazo depende da fila de shape e do tipo de prancha, e é combinado logo na conversa inicial, sem enrolação. Projeto mais simples sai mais rápido, projeto do zero pede um pouco mais de tempo. Você sempre sabe onde a sua prancha está.

## Comece agora

O primeiro passo é o mais fácil. [Chama o shaper no WhatsApp](/), conta seu momento e comece a desenhar a sua prancha. Se quiser entender preço antes, dá uma olhada em [quanto custa uma prancha sob medida](/blog/post?slug=quanto-custa-prancha-sob-medida).$md$,
  6, true, now()
),

-- =========================================================================
-- 5) DIFERENCIAL / SUSTENTABILIDADE  ("prancha sustentável", "Carbon Trash")
-- =========================================================================
(
  'prancha-de-surf-sustentavel-carbon-trash',
  'pt',
  $t$Prancha de surf sustentável: o que é a tecnologia Carbon Trash$t$,
  $e$O que torna uma prancha de surf mais sustentável e como a tecnologia Carbon Trash da Baltazar Customs reaproveita resíduo de carbono para reforçar a prancha e reduzir desperdício.$e$,
  '',
  $md$Surfista vive do mar, então faz sentido que a prancha embaixo do braço respeite o mar. O problema é que a fabricação de prancha, no geral, gera bastante resíduo e usa materiais pesados pro ambiente. A linha Carbon Trash nasceu pra atacar exatamente esse ponto, sem abrir mão de desempenho.

## Por que prancha comum não é lá muito sustentável

Uma prancha de surf tradicional junta espuma de poliuretano, resina e fibra. No processo de laminação, sobra material, e boa parte do carbono e da fibra usados na indústria vira descarte. Multiplicado por milhares de pranchas, isso é bastante coisa indo pro lixo.

Sustentabilidade em prancha não é marketing bonito. É o que se faz com o resíduo, com a durabilidade e com o ciclo de vida da prancha.

## O que é a tecnologia Carbon Trash

O [Carbon Trash](/carbon-trash) é a resposta da Baltazar Customs pra isso. A ideia é direta: reaproveitar resíduo de carbono, que normalmente seria descartado, e incorporar na laminação da prancha. O que iria pro lixo vira reforço estrutural.

O resultado é uma prancha que:

- **Reaproveita material** que seria descartado, reduzindo desperdício.
- **Ganha reforço** onde o carbono entra, o que ajuda na resposta e na vida útil.
- **Tem identidade própria**, porque cada laminação com resíduo fica única.

> Não é jogar fora e comprar de novo. É transformar o que sobra em parte do que faz a prancha melhor.

## Sustentável e com desempenho

Tem gente que acha que prancha mais consciente é prancha mole ou sem performance. Não é o caso. O carbono é um material de reforço de verdade, usado justamente por causa da rigidez e da resposta que dá. Aqui ele entra a partir de resíduo, então você leva desempenho e ainda tira material do lixo. Os dois lados ganham.

Isso combina com a proposta artesanal da casa: cada prancha já é única por ser feita à mão e sob medida. Com o Carbon Trash, ela carrega também uma história de reaproveitamento.

## A durabilidade também conta

A parte mais esquecida da sustentabilidade é a durabilidade. Uma prancha que dura mais é uma prancha que você não precisa substituir tão cedo, e isso por si só reduz consumo. Por ser artesanal, feita pelo shaper local e com reforço, uma prancha da casa é feita pra durar no seu uso, não pra virar descarte na temporada seguinte.

E como o shaper é daqui, reparo e ajuste voltam pra mesma mão, o que estica ainda mais a vida da prancha em vez de mandá-la pro lixo.

## Quer uma prancha assim?

Se você quer uma prancha sob medida, feita à mão, com desempenho e com uma pegada mais consciente, [fala com o shaper no WhatsApp](/) e pergunte sobre a linha Carbon Trash. Dá pra ver os detalhes da tecnologia na [página do Carbon Trash](/carbon-trash).$md$,
  6, true, now()
)

on conflict (slug) do update set
  lang         = excluded.lang,
  title        = excluded.title,
  excerpt      = excluded.excerpt,
  cover_image  = excluded.cover_image,
  body         = excluded.body,
  read_minutes = excluded.read_minutes,
  published    = excluded.published,
  updated_at   = now();
