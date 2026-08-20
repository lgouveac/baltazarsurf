#!/usr/bin/env python3
"""Gera /en/index.html e /es/index.html a partir do index.html (PT).
Reexecutável: é o passo de build da i18n. Só troca texto; o JS fica idêntico,
então a lógica do chat continua funcionando (as opções são traduzidas de forma
consistente em todo o arquivo, inclusive nas comparações e chaves de objeto)."""
import re, os, pathlib

SRC = 'index.html'
DOMAIN = 'https://www.baltazarcustomssurfboards.com'

# ------------------------------------------------------------------
# Mapas de tradução. Ordem = mais longo primeiro (evita colisão de substring).
# GLOBAL: aplicado em todo o arquivo (HTML + JS). Consistência mantém a lógica.
# ------------------------------------------------------------------
EN = [
 # meta / head
 ('Baltazar Customs Surfboards | Pranchas artesanais sob medida no Rio de Janeiro',
  'Baltazar Customs Surfboards | Handmade custom surfboards in Rio de Janeiro'),
 ('Shaper artesanal no Recreio (Rio de Janeiro). Pranchas de surf customizadas sob medida, do shape à laminação, do thruster ao longboard. Linha exclusiva Carbon Trash em carbono. A partir de R$ 2.600.',
  'Artisan shaper in Recreio, Rio de Janeiro. Custom surfboards made to measure, from shaping to glassing, from thruster to longboard. Exclusive Carbon Trash carbon line. From R$ 2,600.'),
 ('Pranchas de surf artesanais sob medida no Rio de Janeiro. Performance, arte e a linha exclusiva Carbon Trash. A partir de R$ 2.600.',
  'Handmade custom surfboards in Rio de Janeiro. Performance, art and the exclusive Carbon Trash line. From R$ 2,600.'),
 ('Pranchas de surf artesanais sob medida no Rio de Janeiro. A partir de R$ 2.600.',
  'Handmade custom surfboards in Rio de Janeiro. From R$ 2,600.'),
 ('Tigre, selo Baltazar Customs Surfboards', 'Tiger, Baltazar Customs Surfboards seal'),
 # nav
 ('>A Coleção<', '>The Collection<'),
 ('>Como Funciona<', '>How It Works<'),
 ('>Baltazar<', '>Baltazar<'),
 # hero
 ('Pranchas de surf artesanais feitas à mão. Recreio, Rio de Janeiro.',
  'Handmade custom surfboards. Recreio, Rio de Janeiro.'),
 ('Cada prancha é única. Você se inspira, a gente faz a sua.',
  'Every board is one of a kind. You get inspired, we shape yours.'),
 ('Quero Minha Prancha', 'I Want My Board'),
 # --- formulário de pedido + cupom ---
 ('Peça sua prancha', 'Order your board'),
 ('O shaper te retorna pra fechar os detalhes', 'The shaper gets back to you with the details'),
 ('10% OFF comprando pelo site com o cupom ', '10% OFF when you order through the site with code '),
 ('Comprando pelo site: ', 'Buying through the site: '),
 (' com o cupom ', ' with code '),
 ('Nome *', 'Name *'),
 ('Email ou WhatsApp *', 'Email or WhatsApp *'),
 ('pra gente te retornar', 'so we can get back to you'),
 ('Opcional. Ajuda o shaper a já pensar na sua prancha', 'Optional. Helps the shaper start planning your board'),
 ('Tipo de prancha', 'Board type'),
 ('Sem preferência / me ajude a decidir', 'No preference / help me decide'),
 ('Altura (cm)', 'Height (cm)'),
 ('Peso (kg)', 'Weight (kg)'),
 ('Onda que mais surfa', 'Wave you surf most'),
 ('Conta o que você procura, prazo, referências...', 'Tell us what you are after, timing, references...'),
 ('Enviar pedido', 'Send request'),
 ('Seus dados vão direto pro shaper. Sem spam.', 'Your details go straight to the shaper. No spam.'),
 ('Preencha nome e contato.', 'Please fill in name and contact.'),
 ('Enviando...', 'Sending...'),
 ('Não consegui enviar agora. Tenta de novo, ou manda pra baltazar.dev@flowcode.cc', 'Could not send right now. Please try again, or email baltazar.dev@flowcode.cc'),
 ('Seu pedido chegou pro shaper. Em breve a gente te retorna pra fechar arte, medidas e o pagamento com os 10% do cupom CARBON1000.', 'Your request reached the shaper. We will get back to you soon to sort out art, measurements and payment with the 10% CARBON1000 code.'),
 ('Recebido', 'Got it'),
 ('Nº do pedido:', 'Order no.:'),
 ('Escolher...', 'Choose...'),
 # --- depoimento / FAQ desconto / CTA fixo / rodapé ---
 ('Quem rema com uma Baltazar', 'Who rides a Baltazar'),
 ('"Carbon Trash é um foguete. Rápida, responde bem e resistente demais."', '"The Carbon Trash is a rocket. Fast, responsive and tough as nails."'),
 ('>Tem desconto?<', '>Is there a discount?<'),
 ('"Tem desconto?"', '"Is there a discount?"'),
 ('Tem. Pedindo pelo site, o cupom CARBON1000 dá 10% de desconto no valor da prancha. Você envia o pedido pelo formulário e o desconto entra no fechamento com o shaper.', 'Yes. Order through the site and the CARBON1000 code takes 10% off the board. You send the request through the form and the discount is applied when the shaper closes your quote.'),
 ('10% OFF no site', '10% OFF on the site'),
 ('Ver mais pranchas', 'See more boards'),
 ('>Pedido</span>', '>Order</span>'),
 ('>Linha exclusiva<', '>Exclusive line<'),
 ('Baltazar Customs | Pranchas de surf feitas à mão no Rio', 'Baltazar Customs | Handmade custom surfboards in Rio'),
 ('Shaper artesanal no Recreio. Cada prancha é shapeada sob medida pro seu corpo, seu nível e as suas ondas. 10% OFF pedindo pelo site com o cupom CARBON1000.', 'Artisan shaper in Recreio, Rio. Every board is shaped to your body, your level and your waves. 10% OFF when you order through the site with code CARBON1000.'),
 ('Cada prancha é única, feita à mão sob medida no Recreio, Rio de Janeiro. 10% OFF pelo site com o cupom CARBON1000.', 'Every board is one of a kind, handmade to measure in Recreio, Rio de Janeiro. 10% OFF through the site with code CARBON1000.'),
 ('Prancha Carbon Trash da Baltazar Customs, feita à mão no Recreio', 'Baltazar Customs Carbon Trash board, handmade in Recreio'),
 ('>Sete construções<', '>Seven constructions<'),
 ('>Ver na coleção<', '>See in the collection<'),
 ('Nível', 'Level'),
 ('Mensagem', 'Message'),
 ('Fechar', 'Close'),
 ('Ver a Coleção', 'See the Collection'),
 # coleção
 ('Conheça algumas das pranchas únicas já criadas', 'Some of the one-of-a-kind boards already made'),
 ('Use como inspiração. Não repetimos pranchas. Você escolhe um modelo com a sua cara e a gente shapeia a sua, do seu jeito. À mão, sob medida, ',
  'Use them as inspiration. We never repeat a board. You pick a model with your face and we shape yours, your way. By hand, made to measure, '),
 ('a partir de R$ 2.600', 'from R$ 2,600'),
 ('Preço por tamanho', 'Price by size'),
 ('até 6′3″', 'up to 6′3″'),
 ('Arte e acabamentos especiais podem ter custo adicional.',
  'Custom art and special finishes may cost extra.'),
 # carbon trash
 ('>Destaque<', '>Featured<'),
 ('Prancha de carbono construída com retalhos descartados, o trash. Os fios são espalhados à mão na resina, e cada padrão é impossível de repetir. Performance, flexibilidade e resistência únicas.',
  'A carbon board built from discarded offcuts, the trash. The fibers are spread by hand into the resin, and every pattern is impossible to repeat. Unique performance, flex and strength.'),
 ('>Construções<', '>Builds<'),
 ('Ver Carbon Trash', 'See Carbon Trash'),
 ('Saiba mais →', 'Learn more →'),
 # filtros
 ('data-type="Todas">Todas<', 'data-type="Todas">All<'),
 ('data-type="Outras">Outras<', 'data-type="Outras">Other<'),
 ('Não sei qual escolher? Fale com o shaper.', 'Not sure which one? Talk to the shaper.'),
 # como funciona
 ('Da inspiração à sua prancha.', 'From inspiration to your board.'),
 ('Inspire-se', 'Get inspired'),
 ('Navegue pela coleção e escolha um modelo com a sua cara. Cada peça é única. Nunca repetimos uma prancha.',
  'Browse the collection and pick a model with your face. Every piece is unique. We never repeat a board.'),
 ('Conte sobre você', 'Tell us about you'),
 ('Com o Shaper, passe altura, peso, nível e o tipo de onda que você surfa. A gente sugere a litragem e a quilha ideais.',
  'In the Shaper chat, share your height, weight, level and the kind of wave you surf. We suggest the ideal volume and fins.'),
 ('Reserve e receba a sua', 'Book it and get yours'),
 ('Feche pelo site. Depois, o Baltazar acerta os detalhes finais com você e shapeia a sua prancha à mão, sob medida.',
  'Close the order on the site. Then Baltazar settles the final details with you and shapes your board by hand, made to measure.'),
 # césar
 ('>O Shaper<', '>The Shaper<'),
 ('Antes de ser shaper, o César Baltazar é surfista. Foi lendo o mar do Rio de Janeiro que ele entrou na oficina pela primeira vez, atrás da prancha exata que a onda pedia e que não existia na prateleira.',
  'Before being a shaper, César Baltazar is a surfer. Reading the sea of Rio de Janeiro is what first led him into the workshop, chasing the exact board the wave was asking for and that didn’t exist on the rack.'),
 ('Desde então transforma blocos de espuma em pranchas, uma de cada vez, à mão, do shape à laminação. Não trabalha com linha de produção e praticamente nunca repete um modelo: cada prancha nasce única, pensada pro corpo, o nível e o surfe de quem vai remar nela.',
  'Since then he turns foam blanks into boards, one at a time, by hand, from shaping to glassing. No production line, and he almost never repeats a model: every board is born unique, built for the body, level and surfing of whoever will paddle it.'),
 ('Do planer à resina, o que sai do shaper é parte ferramenta, parte obra de arte, feito pra performar na água e durar como uma peça que conta uma história.',
  'From the planer to the resin, what leaves the shaper is part tool, part work of art, made to perform in the water and to last like a piece that tells a story.'),
 ('[ Rascunho, história oficial em breve ]', '[ Draft — official story coming soon ]'),
 ('>Na Água<', '>In the Water<'),
 ('>A nova geração<', '>The next generation<'),
 ('O filho seguiu a linhagem, a cara do pai dentro d\'água, surfando as pranchas que saem do mesmo galpão.',
  'The son followed the lineage: his father’s face in the water, surfing the boards that come out of the same shed.'),
 # faq
 ('>Dúvidas<', '>FAQ<'),
 ('Perguntas frequentes', 'Frequently asked questions'),
 ('Como funciona a encomenda?', 'How does ordering work?'),
 ('Você escolhe um modelo como inspiração, conta suas medidas no formulário e reserva pelo site. Cada prancha é única e feita à mão. Depois do pagamento, o Baltazar acerta com você os detalhes finais (arte, cor e medidas).',
  'You pick a model as inspiration, share your measurements in the form and book on the site. Every board is unique and handmade. After payment, Baltazar settles the final details with you (art, color and measurements).'),
 ('Quanto custa?', 'How much does it cost?'),
 ('O valor é por tamanho: de R$ 2.600 (até 6′3″) a R$ 3.600 (8′6″–9′6″). Arte e acabamentos especiais podem ter custo adicional.',
  'Price is by size: from R$ 2,600 (up to 6′3″) to R$ 3,600 (8′6″–9′6″). Custom art and special finishes may cost extra.'),
 ('Quanto tempo leva pra ficar pronta?', 'How long does it take?'),
 ('O prazo varia conforme a fila do shaper. A gente confirma a data certinha com você no momento do pedido.',
  'Lead time depends on the shaper’s queue. We confirm the exact date with you when you order.'),
 ('Como sei a litragem ideal?', 'How do I know the right volume?'),
 ('A litragem (volume em litros) define flutuação e remada: quanto mais iniciante ou mais pesado, mais litros; quanto mais avançado, menos. No chat, a gente sugere uma litragem a partir do seu peso e nível.',
  'Volume (in liters) defines float and paddling: the more beginner or heavier you are, the more liters; the more advanced, the fewer. In the chat we suggest a volume from your weight and level.'),
 ('Single, twin, thruster ou quad?', 'Single, twin, thruster or quad?'),
 ('Single: clássica, deslize suave. Twin: solta e veloz em ondas pequenas. Thruster (3 quilhas): a mais versátil e controlável. Quad (4 quilhas): rápida em ondas ocas e tubulares.',
  'Single: classic, smooth glide. Twin: loose and fast in small waves. Thruster (3 fins): the most versatile and controllable. Quad (4 fins): fast in hollow, barreling waves.'),
 ('Fish, mid-length ou longboard?', 'Fish, mid-length or longboard?'),
 ('Fish: curta e larga, perfeita pra ondas pequenas. Mid-length: versátil e fácil de remar. Longboard: deslize clássico, ótima pra iniciantes e ondas suaves.',
  'Fish: short and wide, perfect for small waves. Mid-length: versatile and easy to paddle. Longboard: classic glide, great for beginners and mellow waves.'),
 ('O que é o "copinho"?', 'What is the fin box (“copinho”)?'),
 ('É o sistema de quilha, a caixa onde a quilha encaixa. Os mais comuns são FCS II (encaixa sem ferramenta) e Futures (encaixe único, bem firme), além da caixa de single.',
  'It’s the fin system, the box where the fin locks in. The most common are FCS II (tool-free) and Futures (single, very firm plug), plus the single-fin box.'),
 ('O que é a Carbon Trash?', 'What is Carbon Trash?'),
 ('Construímos a Carbon Trash reaproveitando retalhos de carbono descartados, o trash. Os fios são espalhados à mão na resina, então cada padrão é único. Performance, flexibilidade e resistência únicas.',
  'We build the Carbon Trash by reusing discarded carbon offcuts, the trash. The fibers are spread by hand into the resin, so every pattern is unique. Unique performance, flex and strength.'),
 # manifesto
 ('"Uma prancha deve ser tanto uma obra de arte na parede quanto uma ferramenta na água."',
  '“A surfboard should be as much a work of art on the wall as a tool in the water.”'),
 # footer
 ('Sobre o Shaper', 'About the Shaper'),
 ('>Processo<', '>Process<'),
 ('>Glossário<', '>Glossary<'),
 ('&copy; 2026 BALTAZAR CUSTOMS. FEITO À MÃO NO RIO.', '&copy; 2026 BALTAZAR CUSTOMS. HANDMADE IN RIO.'),
 # board modal / chat header
 ('Shaper Baltazar', 'Shaper Baltazar'),
 ('Monte sua prancha', 'Build your board'),
 # chat steps (bot text + options + placeholders) — global & consistent
 ('Fala! Sou o assistente do shaper. Que tipo de prancha tem a sua cara?',
  'Hey! I’m the shaper’s assistant. What kind of board fits you?'),
 ('Me ajude a decidir', 'Help me decide'),
 ('Beleza. Qual a sua altura? (em cm)', 'Cool. How tall are you? (in cm)'),
 ('E o seu peso? (em kg)', 'And your weight? (in kg)'),
 ('Como você descreve seu nível no surfe?', 'How would you describe your surf level?'),
 ('Iniciante', 'Beginner'),
 ('Intermediário', 'Intermediate'),
 ('Avançado', 'Advanced'),
 ('Profissional', 'Pro'),
 ('Que tipo de onda você mais surfa?', 'What kind of wave do you surf most?'),
 ('Pequena/fraca', 'Small/weak'),
 ('Média', 'Medium'),
 ('Grande/forte', 'Big/powerful'),
 ('Tubular', 'Barreling'),
 ('Configuração de quilhas que você prefere?', 'Which fin setup do you prefer?'),
 ('Não sei', 'Not sure'),
 ('E o sistema de quilha (o "copinho")?', 'And the fin system (the box)?'),
 ('Caixa de single', 'Single box'),
 ('Show! Como é o seu nome?', 'Great! What’s your name?'),
 ('Seu nome', 'Your name'),
 ('Por último: um e-mail ou telefone pro Baltazar acertar os detalhes depois.',
  'Last one: an email or phone so Baltazar can sort the details later.'),
 ('email ou telefone', 'email or phone'),
 # chat composed
 ('Boa escolha, uma ', 'Good pick, a '),
 ('. Vamos personalizar a sua.', '. Let’s customize yours.'),
 ('Longboard ou Mid-Length (estável e fácil de remar)', 'Longboard or Mid-Length (stable and easy to paddle)'),
 ('Twin Fin (solta e veloz em ondas fracas)', 'Twin Fin (loose and fast in weak waves)'),
 ('Mid-Length (versátil para o dia a dia)', 'Mid-Length (versatile for everyday)'),
 ('Thruster (mais estável e controlável)', 'Thruster (more stable and controllable)'),
 ('Quad (rápida no tubo)', 'Quad (fast in the barrel)'),
 ('Twin (solta e veloz)', 'Twin (loose and fast)'),
 ('Thruster (versátil)', 'Thruster (versatile)'),
 ('a definir com o shaper', 'to be defined with the shaper'),
 ('Fechou', 'Done'),
 ('! Resumo da sua prancha:', '! Summary of your board:'),
 ('• Categoria: ', '• Category: '),
 ('• Litragem sugerida: ', '• Suggested volume: '),
 ('a calcular', 'to calculate'),
 ('• Quilhas: ', '• Fins: '),
 ('• Copinho: ', '• Fin box: '),
 ('• Perfil: ', '• Profile: '),
 ('• Onda: ', '• Wave: '),
 ('• Valor: a partir de ', '• Price: from '),
 (' (conforme o tamanho final)', ' (depending on final size)'),
 ('Cada prancha é única e feita à mão. Depois do pagamento, o Baltazar acerta com você os detalhes finais (arte, cor e medidas).',
  'Every board is unique and handmade. After payment, Baltazar settles the final details with you (art, color and measurements).'),
 ('Reservar e ir para o pagamento', 'Book and go to payment'),
 ('Finalizar pedido', 'Place order'),
 ('O link de pagamento está sendo configurado. Em breve você fecha tudo por aqui!',
  'The payment link is being set up. Soon you’ll close everything right here!'),
 ('Pagamento online em configuração.', 'Online payment being set up.'),
 ('Recomeçar', 'Start over'),
]

ES = [
 ('Baltazar Customs Surfboards | Pranchas artesanais sob medida no Rio de Janeiro',
  'Baltazar Customs Surfboards | Tablas de surf artesanales a medida en Río de Janeiro'),
 ('Shaper artesanal no Recreio (Rio de Janeiro). Pranchas de surf customizadas sob medida, do shape à laminação, do thruster ao longboard. Linha exclusiva Carbon Trash em carbono. A partir de R$ 2.600.',
  'Shaper artesanal en Recreio (Río de Janeiro). Tablas de surf a medida, del shape al laminado, del thruster al longboard. Línea exclusiva Carbon Trash en carbono. Desde R$ 2.600.'),
 ('Pranchas de surf artesanais sob medida no Rio de Janeiro. Performance, arte e a linha exclusiva Carbon Trash. A partir de R$ 2.600.',
  'Tablas de surf artesanales a medida en Río de Janeiro. Rendimiento, arte y la línea exclusiva Carbon Trash. Desde R$ 2.600.'),
 ('Pranchas de surf artesanais sob medida no Rio de Janeiro. A partir de R$ 2.600.',
  'Tablas de surf artesanales a medida en Río de Janeiro. Desde R$ 2.600.'),
 ('Tigre, selo Baltazar Customs Surfboards', 'Tigre, sello Baltazar Customs Surfboards'),
 ('>A Coleção<', '>La Colección<'),
 ('>Como Funciona<', '>Cómo Funciona<'),
 ('>Baltazar<', '>Baltazar<'),
 ('Pranchas de surf artesanais feitas à mão. Recreio, Rio de Janeiro.',
  'Tablas de surf artesanales hechas a mano. Recreio, Río de Janeiro.'),
 ('Cada prancha é única. Você se inspira, a gente faz a sua.',
  'Cada tabla es única. Te inspiras y nosotros hacemos la tuya.'),
 ('Quero Minha Prancha', 'Quiero Mi Tabla'),
 # --- formulario de pedido + cupon ---
 ('Peça sua prancha', 'Pide tu tabla'),
 ('O shaper te retorna pra fechar os detalhes', 'El shaper te responde para cerrar los detalles'),
 ('10% OFF comprando pelo site com o cupom ', '10% OFF comprando por el sitio con el cupón '),
 ('Comprando pelo site: ', 'Comprando por el sitio: '),
 (' com o cupom ', ' con el cupón '),
 ('Nome *', 'Nombre *'),
 ('Email ou WhatsApp *', 'Email o WhatsApp *'),
 ('pra gente te retornar', 'para poder responderte'),
 ('Opcional. Ajuda o shaper a já pensar na sua prancha', 'Opcional. Ayuda al shaper a pensar tu tabla'),
 ('Tipo de prancha', 'Tipo de tabla'),
 ('Sem preferência / me ajude a decidir', 'Sin preferencia / ayúdame a decidir'),
 ('Altura (cm)', 'Altura (cm)'),
 ('Peso (kg)', 'Peso (kg)'),
 ('Onda que mais surfa', 'Ola que más surfeas'),
 ('Conta o que você procura, prazo, referências...', 'Cuéntanos qué buscas, plazo, referencias...'),
 ('Enviar pedido', 'Enviar pedido'),
 ('Seus dados vão direto pro shaper. Sem spam.', 'Tus datos van directo al shaper. Sin spam.'),
 ('Preencha nome e contato.', 'Completa nombre y contacto.'),
 ('Enviando...', 'Enviando...'),
 ('Não consegui enviar agora. Tenta de novo, ou manda pra baltazar.dev@flowcode.cc', 'No se pudo enviar ahora. Inténtalo de nuevo o escribe a baltazar.dev@flowcode.cc'),
 ('Seu pedido chegou pro shaper. Em breve a gente te retorna pra fechar arte, medidas e o pagamento com os 10% do cupom CARBON1000.', 'Tu pedido llegó al shaper. Pronto te respondemos para cerrar arte, medidas y el pago con el 10% del cupón CARBON1000.'),
 ('Recebido', 'Recibido'),
 ('Nº do pedido:', 'N.º de pedido:'),
 ('Escolher...', 'Elegir...'),
 # --- depoimento / FAQ descuento / CTA fijo / pie ---
 ('Quem rema com uma Baltazar', 'Quién surfea una Baltazar'),
 ('"Carbon Trash é um foguete. Rápida, responde bem e resistente demais."', '"La Carbon Trash es un cohete. Rápida, responde bien y resistente de sobra."'),
 ('>Tem desconto?<', '>¿Hay descuento?<'),
 ('"Tem desconto?"', '"¿Hay descuento?"'),
 ('Tem. Pedindo pelo site, o cupom CARBON1000 dá 10% de desconto no valor da prancha. Você envia o pedido pelo formulário e o desconto entra no fechamento com o shaper.', 'Sí. Pidiendo por el sitio, el cupón CARBON1000 da 10% de descuento en el valor de la tabla. Envías el pedido por el formulario y el descuento entra al cerrar con el shaper.'),
 ('10% OFF no site', '10% OFF en el sitio'),
 ('Ver mais pranchas', 'Ver más tablas'),
 ('>Pedido</span>', '>Pedido</span>'),
 ('>Linha exclusiva<', '>Línea exclusiva<'),
 ('Baltazar Customs | Pranchas de surf feitas à mão no Rio', 'Baltazar Customs | Tablas de surf hechas a mano en Río'),
 ('Shaper artesanal no Recreio. Cada prancha é shapeada sob medida pro seu corpo, seu nível e as suas ondas. 10% OFF pedindo pelo site com o cupom CARBON1000.', 'Shaper artesanal en Recreio, Río. Cada tabla se shapea a medida para tu cuerpo, tu nivel y tus olas. 10% OFF pidiendo por el sitio con el cupón CARBON1000.'),
 ('Cada prancha é única, feita à mão sob medida no Recreio, Rio de Janeiro. 10% OFF pelo site com o cupom CARBON1000.', 'Cada tabla es única, hecha a mano a medida en Recreio, Río de Janeiro. 10% OFF por el sitio con el cupón CARBON1000.'),
 ('Prancha Carbon Trash da Baltazar Customs, feita à mão no Recreio', 'Tabla Carbon Trash de Baltazar Customs, hecha a mano en Recreio'),
 ('>Sete construções<', '>Siete construcciones<'),
 ('>Ver na coleção<', '>Ver en la colección<'),
 ('Nível', 'Nivel'),
 ('Mensagem', 'Mensaje'),
 ('Fechar', 'Cerrar'),
 ('Ver a Coleção', 'Ver la Colección'),
 ('Conheça algumas das pranchas únicas já criadas', 'Algunas de las tablas únicas ya creadas'),
 ('Use como inspiração. Não repetimos pranchas. Você escolhe um modelo com a sua cara e a gente shapeia a sua, do seu jeito. À mão, sob medida, ',
  'Úsalos como inspiración. No repetimos tablas. Eliges un modelo con tu cara y hacemos la tuya, a tu manera. A mano, a medida, '),
 ('a partir de R$ 2.600', 'desde R$ 2.600'),
 ('Preço por tamanho', 'Precio por tamaño'),
 ('até 6′3″', 'hasta 6′3″'),
 ('Arte e acabamentos especiais podem ter custo adicional.',
  'El arte y los acabados especiales pueden tener costo adicional.'),
 ('>Destaque<', '>Destacado<'),
 ('Prancha de carbono construída com retalhos descartados, o trash. Os fios são espalhados à mão na resina, e cada padrão é impossível de repetir. Performance, flexibilidade e resistência únicas.',
  'Tabla de carbono construida con retazos descartados, el trash. Las fibras se esparcen a mano en la resina y cada patrón es imposible de repetir. Rendimiento, flexibilidad y resistencia únicos.'),
 ('>Construções<', '>Construcciones<'),
 ('Ver Carbon Trash', 'Ver Carbon Trash'),
 ('Saiba mais →', 'Saber más →'),
 ('data-type="Todas">Todas<', 'data-type="Todas">Todas<'),
 ('data-type="Outras">Outras<', 'data-type="Outras">Otras<'),
 ('Não sei qual escolher? Fale com o shaper.', '¿No sabes cuál elegir? Habla con el shaper.'),
 ('Da inspiração à sua prancha.', 'De la inspiración a tu tabla.'),
 ('Inspire-se', 'Inspírate'),
 ('Navegue pela coleção e escolha um modelo com a sua cara. Cada peça é única. Nunca repetimos uma prancha.',
  'Navega por la colección y elige un modelo con tu cara. Cada pieza es única. Nunca repetimos una tabla.'),
 ('Conte sobre você', 'Cuéntanos de ti'),
 ('Com o Shaper, passe altura, peso, nível e o tipo de onda que você surfa. A gente sugere a litragem e a quilha ideais.',
  'En el chat del Shaper, pasa tu altura, peso, nivel y el tipo de ola que surfeas. Sugerimos el litraje y las quillas ideales.'),
 ('Reserve e receba a sua', 'Reserva y recibe la tuya'),
 ('Feche pelo site. Depois, o Baltazar acerta os detalhes finais com você e shapeia a sua prancha à mão, sob medida.',
  'Cierra el pedido en el sitio. Luego Baltazar afina los detalles finales contigo y hace tu tabla a mano, a medida.'),
 ('>O Shaper<', '>El Shaper<'),
 ('Antes de ser shaper, o César Baltazar é surfista. Foi lendo o mar do Rio de Janeiro que ele entrou na oficina pela primeira vez, atrás da prancha exata que a onda pedia e que não existia na prateleira.',
  'Antes de ser shaper, César Baltazar es surfista. Leyendo el mar de Río de Janeiro entró por primera vez al taller, buscando la tabla exacta que la ola pedía y que no existía en la estantería.'),
 ('Desde então transforma blocos de espuma em pranchas, uma de cada vez, à mão, do shape à laminação. Não trabalha com linha de produção e praticamente nunca repete um modelo: cada prancha nasce única, pensada pro corpo, o nível e o surfe de quem vai remar nela.',
  'Desde entonces transforma bloques de espuma en tablas, una a una, a mano, del shape al laminado. No trabaja con línea de producción y casi nunca repite un modelo: cada tabla nace única, pensada para el cuerpo, el nivel y el surf de quien va a remarla.'),
 ('Do planer à resina, o que sai do shaper é parte ferramenta, parte obra de arte, feito pra performar na água e durar como uma peça que conta uma história.',
  'Del planer a la resina, lo que sale del shaper es parte herramienta, parte obra de arte, hecho para rendir en el agua y durar como una pieza que cuenta una historia.'),
 ('[ Rascunho, história oficial em breve ]', '[ Borrador — historia oficial pronto ]'),
 ('>Na Água<', '>En el Agua<'),
 ('>A nova geração<', '>La nueva generación<'),
 ('O filho seguiu a linhagem, a cara do pai dentro d\'água, surfando as pranchas que saem do mesmo galpão.',
  'El hijo siguió el linaje, la cara del padre dentro del agua, surfeando las tablas que salen del mismo galpón.'),
 ('>Dúvidas<', '>Preguntas<'),
 ('Perguntas frequentes', 'Preguntas frecuentes'),
 ('Como funciona a encomenda?', '¿Cómo funciona el pedido?'),
 ('Você escolhe um modelo como inspiração, conta suas medidas no formulário e reserva pelo site. Cada prancha é única e feita à mão. Depois do pagamento, o Baltazar acerta com você os detalhes finais (arte, cor e medidas).',
  'Eliges un modelo como inspiración, cuentas tus medidas en el formulario y reservas en el sitio. Cada tabla es única y hecha a mano. Tras el pago, Baltazar afina contigo los detalles finales (arte, color y medidas).'),
 ('Quanto custa?', '¿Cuánto cuesta?'),
 ('O valor é por tamanho: de R$ 2.600 (até 6′3″) a R$ 3.600 (8′6″–9′6″). Arte e acabamentos especiais podem ter custo adicional.',
  'El precio es por tamaño: de R$ 2.600 (hasta 6′3″) a R$ 3.600 (8′6″–9′6″). El arte y los acabados especiales pueden tener costo adicional.'),
 ('Quanto tempo leva pra ficar pronta?', '¿Cuánto tarda en estar lista?'),
 ('O prazo varia conforme a fila do shaper. A gente confirma a data certinha com você no momento do pedido.',
  'El plazo depende de la cola del shaper. Confirmamos la fecha exacta contigo al hacer el pedido.'),
 ('Como sei a litragem ideal?', '¿Cómo sé el litraje ideal?'),
 ('A litragem (volume em litros) define flutuação e remada: quanto mais iniciante ou mais pesado, mais litros; quanto mais avançado, menos. No chat, a gente sugere uma litragem a partir do seu peso e nível.',
  'El litraje (volumen en litros) define flotación y remada: cuanto más principiante o más pesado, más litros; cuanto más avanzado, menos. En el chat sugerimos un litraje a partir de tu peso y nivel.'),
 ('Single, twin, thruster ou quad?', '¿Single, twin, thruster o quad?'),
 ('Single: clássica, deslize suave. Twin: solta e veloz em ondas pequenas. Thruster (3 quilhas): a mais versátil e controlável. Quad (4 quilhas): rápida em ondas ocas e tubulares.',
  'Single: clásica, deslizamiento suave. Twin: suelta y veloz en olas pequeñas. Thruster (3 quillas): la más versátil y controlable. Quad (4 quillas): rápida en olas huecas y tubulares.'),
 ('Fish, mid-length ou longboard?', '¿Fish, mid-length o longboard?'),
 ('Fish: curta e larga, perfeita pra ondas pequenas. Mid-length: versátil e fácil de remar. Longboard: deslize clássico, ótima pra iniciantes e ondas suaves.',
  'Fish: corta y ancha, perfecta para olas pequeñas. Mid-length: versátil y fácil de remar. Longboard: deslizamiento clásico, ideal para principiantes y olas suaves.'),
 ('O que é o "copinho"?', '¿Qué es la caja de quilla (“copinho”)?'),
 ('É o sistema de quilha, a caixa onde a quilha encaixa. Os mais comuns são FCS II (encaixa sem ferramenta) e Futures (encaixe único, bem firme), além da caixa de single.',
  'Es el sistema de quillas, la caja donde encaja la quilla. Los más comunes son FCS II (sin herramienta) y Futures (encaje único, muy firme), además de la caja de single.'),
 ('O que é a Carbon Trash?', '¿Qué es la Carbon Trash?'),
 ('Construímos a Carbon Trash reaproveitando retalhos de carbono descartados, o trash. Os fios são espalhados à mão na resina, então cada padrão é único. Performance, flexibilidade e resistência únicas.',
  'Construimos la Carbon Trash reutilizando retazos de carbono descartados, el trash. Las fibras se esparcen a mano en la resina, así cada patrón es único. Rendimiento, flexibilidad y resistencia únicos.'),
 ('"Uma prancha deve ser tanto uma obra de arte na parede quanto uma ferramenta na água."',
  '“Una tabla debe ser tanto una obra de arte en la pared como una herramienta en el agua.”'),
 ('Sobre o Shaper', 'Sobre el Shaper'),
 ('>Processo<', '>Proceso<'),
 ('>Glossário<', '>Glosario<'),
 ('&copy; 2026 BALTAZAR CUSTOMS. FEITO À MÃO NO RIO.', '&copy; 2026 BALTAZAR CUSTOMS. HECHO A MANO EN RÍO.'),
 ('Shaper Baltazar', 'Shaper Baltazar'),
 ('Monte sua prancha', 'Arma tu tabla'),
 ('Fala! Sou o assistente do shaper. Que tipo de prancha tem a sua cara?',
  '¡Hola! Soy el asistente del shaper. ¿Qué tipo de tabla tiene tu cara?'),
 ('Me ajude a decidir', 'Ayúdame a decidir'),
 ('Beleza. Qual a sua altura? (em cm)', 'Bien. ¿Cuánto mides? (en cm)'),
 ('E o seu peso? (em kg)', '¿Y tu peso? (en kg)'),
 ('Como você descreve seu nível no surfe?', '¿Cómo describes tu nivel de surf?'),
 ('Iniciante', 'Principiante'),
 ('Intermediário', 'Intermedio'),
 ('Avançado', 'Avanzado'),
 ('Profissional', 'Profesional'),
 ('Que tipo de onda você mais surfa?', '¿Qué tipo de ola surfeas más?'),
 ('Pequena/fraca', 'Pequeña/débil'),
 ('Média', 'Media'),
 ('Grande/forte', 'Grande/fuerte'),
 ('Tubular', 'Tubular'),
 ('Configuração de quilhas que você prefere?', '¿Qué configuración de quillas prefieres?'),
 ('Não sei', 'No sé'),
 ('E o sistema de quilha (o "copinho")?', '¿Y el sistema de quillas (la caja)?'),
 ('Caixa de single', 'Caja de single'),
 ('Show! Como é o seu nome?', '¡Genial! ¿Cuál es tu nombre?'),
 ('Seu nome', 'Tu nombre'),
 ('Por último: um e-mail ou telefone pro Baltazar acertar os detalhes depois.',
  'Por último: un email o teléfono para que Baltazar afine los detalles después.'),
 ('email ou telefone', 'email o teléfono'),
 ('Boa escolha, uma ', 'Buena elección, una '),
 ('. Vamos personalizar a sua.', '. Vamos a personalizar la tuya.'),
 ('Longboard ou Mid-Length (estável e fácil de remar)', 'Longboard o Mid-Length (estable y fácil de remar)'),
 ('Twin Fin (solta e veloz em ondas fracas)', 'Twin Fin (suelta y veloz en olas débiles)'),
 ('Mid-Length (versátil para o dia a dia)', 'Mid-Length (versátil para el día a día)'),
 ('Thruster (mais estável e controlável)', 'Thruster (más estable y controlable)'),
 ('Quad (rápida no tubo)', 'Quad (rápida en el tubo)'),
 ('Twin (solta e veloz)', 'Twin (suelta y veloz)'),
 ('Thruster (versátil)', 'Thruster (versátil)'),
 ('a definir com o shaper', 'a definir con el shaper'),
 ('Fechou', 'Listo'),
 ('! Resumo da sua prancha:', '! Resumen de tu tabla:'),
 ('• Categoria: ', '• Categoría: '),
 ('• Litragem sugerida: ', '• Litraje sugerido: '),
 ('a calcular', 'por calcular'),
 ('• Quilhas: ', '• Quillas: '),
 ('• Copinho: ', '• Caja: '),
 ('• Perfil: ', '• Perfil: '),
 ('• Onda: ', '• Ola: '),
 ('• Valor: a partir de ', '• Precio: desde '),
 (' (conforme o tamanho final)', ' (según el tamaño final)'),
 ('Cada prancha é única e feita à mão. Depois do pagamento, o Baltazar acerta com você os detalhes finais (arte, cor e medidas).',
  'Cada tabla es única y hecha a mano. Tras el pago, Baltazar afina contigo los detalles finales (arte, color y medidas).'),
 ('Reservar e ir para o pagamento', 'Reservar e ir al pago'),
 ('Finalizar pedido', 'Finalizar pedido'),
 ('O link de pagamento está sendo configurado. Em breve você fecha tudo por aqui!',
  '¡El enlace de pago se está configurando. Pronto cierras todo por aquí!'),
 ('Pagamento online em configuração.', 'Pago en línea en configuración.'),
 ('Recomeçar', 'Empezar de nuevo'),
]

HREFLANG = (
 f'<link rel="alternate" hreflang="pt-BR" href="{DOMAIN}/"/>\n'
 f'<link rel="alternate" hreflang="en" href="{DOMAIN}/en/"/>\n'
 f'<link rel="alternate" hreflang="es" href="{DOMAIN}/es/"/>\n'
 f'<link rel="alternate" hreflang="x-default" href="{DOMAIN}/"/>\n'
)

def switcher(active):
    def cls(l): return 'text-black font-medium' if l == active else 'text-neutral-400 hover:text-black'
    return (
     '<div class="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest">'
     f'<a href="/" class="{cls("pt")} transition-colors">PT</a>'
     f'<a href="/en/" class="{cls("en")} transition-colors">EN</a>'
     f'<a href="/es/" class="{cls("es")} transition-colors">ES</a>'
     '</div>'
    )

def apply_map(html, mapping):
    # aplica do mais longo para o mais curto pra evitar colisão de substring
    for pt, tr in sorted(mapping, key=lambda x: -len(x[0])):
        html = html.replace(pt, tr)
    return html

def strip_switcher(html):
    return re.sub(
        r'<div class="flex items-center gap-2 font-sans text-\[10px\] uppercase tracking-widest">.*?</div>\n(?=<div class="flex items-center gap-4">)',
        '', html, count=1, flags=re.DOTALL)

def add_common(html, lang):
    if 'hreflang="en"' not in html:  # hreflang é igual em todos os idiomas
        html = re.sub(r'(<link rel="canonical"[^>]*/>\n)', r'\1' + HREFLANG, html, count=1)
    html = strip_switcher(html)      # remove qualquer switcher pré-existente
    html = html.replace(             # e re-injeta com o idioma ativo correto
        '<div class="flex items-center gap-4">',
        switcher(lang) + '\n<div class="flex items-center gap-4">',
        1)
    return html

src = pathlib.Path(SRC).read_text(encoding='utf-8')

# ---- PT: só adiciona hreflang + switcher ----
pt = add_common(src, 'pt')
pathlib.Path(SRC).write_text(pt, encoding='utf-8')

# ---- EN ----
en = apply_map(src, EN)
en = en.replace('<html class="light" lang="pt-BR">', '<html class="light" lang="en">', 1)
en = en.replace(f'{DOMAIN}/"/>', f'{DOMAIN}/en/"/>')  # canonical + og:url
en = en.replace('content="pt_BR"', 'content="en_US"')
en = add_common(en, 'en')
os.makedirs('en', exist_ok=True)
pathlib.Path('en/index.html').write_text(en, encoding='utf-8')

# ---- ES ----
es = apply_map(src, ES)
es = es.replace('<html class="light" lang="pt-BR">', '<html class="light" lang="es">', 1)
es = es.replace(f'{DOMAIN}/"/>', f'{DOMAIN}/es/"/>')
es = es.replace('content="pt_BR"', 'content="es_ES"')
es = add_common(es, 'es')
os.makedirs('es', exist_ok=True)
pathlib.Path('es/index.html').write_text(es, encoding='utf-8')

print('OK: index.html (PT + hreflang/switcher), en/index.html, es/index.html')
