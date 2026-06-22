# SEO Launch Checklist
**Quando apontar o domínio `baltazarcustomsurfboards.com.br` no Vercel.**

Tudo aqui leva ~30min no total. Sequência importa pouco, mas Search Console é o primeiro porque desbloqueia muitos passos depois.

---

## 1. DNS no Vercel

- No painel Vercel → Project → Settings → Domains
- Adiciona `baltazarcustomsurfboards.com.br` e `www.baltazarcustomsurfboards.com.br`
- Vercel mostra os registros DNS necessários (geralmente um `A` e um `CNAME`)
- No registrador (Registro.br ou onde está hospedado o domínio), aponta esses registros
- Espera propagar (5 min a algumas horas)
- O HTTPS é automático (Let's Encrypt via Vercel)

**Define o redirect:** decide qual é o canônico (com ou sem `www`). Recomendo manter `www` (já está nos canonicals do site). Vercel resolve sozinho — só verifica que `www` é a versão "main" e a não-www redireciona pra ela.

---

## 2. Google Search Console

1. Abre https://search.google.com/search-console
2. **Add property → Domain** (a opção de cima, não URL prefix). Usa `baltazarcustomsurfboards.com.br` (sem www, captura tudo)
3. Google vai pedir verificação via DNS — copia o registro TXT que ele te der
4. No registrador do domínio, adiciona esse TXT
5. Volta no Search Console, clica Verify
6. Depois de verificado, vai em **Sitemaps** → adiciona `https://www.baltazarcustomsurfboards.com.br/sitemap.xml`
7. Vai em **Settings → International Targeting → Country** (se aparecer) → marca Brasil

Depois disso o Google começa a indexar as 8 URLs em poucos dias. Em **Performance** você vai ver as primeiras impressões em ~1-2 semanas.

---

## 3. Bing Webmaster Tools

Alguns LLMs (ex: ChatGPT search, alguns componentes do Copilot) usam o índice do Bing. Vale 5 minutos.

1. Abre https://www.bing.com/webmasters/
2. Add Site → cola a URL
3. Verificação por DNS TXT ou meta tag (DNS é mais durável)
4. Submit sitemap idêntico ao do GSC
5. **Bonus:** Bing tem **Import from GSC** — se você já tem GSC, importa tudo de uma vez

---

## 4. Google Business Profile

Já tem o PDF (`docs/guia-google-business-profile.pdf`). Manda pro César. Quando o perfil for aprovado, edita o campo **Website** com a URL real.

**Importante:** garante que **Nome + Endereço + Telefone (NAP)** seja idêntico:
- No GBP
- No JSON-LD do site (`LocalBusiness`)
- Em qualquer outro listing (Bing Places, Apple Business Connect, redes sociais)

Inconsistência de NAP confunde o Google e atrapalha ranqueamento local.

---

## 5. Apple Business Connect

Pra aparecer no Maps do iPhone (sem ele você não aparece pra ninguém no ecossistema Apple).

1. Abre https://businessconnect.apple.com/
2. Sign in com Apple ID (ou cria)
3. Add location → preenche idêntico ao GBP
4. Verificação por documento ou ligação

Leva ~7 dias pra ativar mas vale.

---

## 6. Google Analytics 4 (ou Plausible)

**Opção A — GA4 (gratuito, robusto):**
1. https://analytics.google.com/ → Create Property
2. Pega o Measurement ID (`G-XXXXXXXXXX`)
3. Adiciona no `<head>` do `index.html` (cola no início, antes do tailwind):

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Cola o mesmo nas subpáginas (carbon-trash, sobre-cesar, etc.) ou crie um snippet compartilhado.

**Opção B — Plausible (pago, leve, privacy-friendly):**
- $9/mês, mas script é tiny e sem cookie banner
- https://plausible.io
- Recomendo se você quer simplicidade total

---

## 7. Vercel Analytics + Speed Insights

Já vem no projeto Vercel, só ativar:
1. Vercel dashboard → Project → Analytics → Enable
2. Speed Insights → Enable

Eles mostram Core Web Vitals reais dos usuários (LCP, CLS, INP). Útil pra correlacionar com SEO.

---

## 8. Schema.org `sameAs`

Quando você tiver Instagram + Facebook da Baltazar Customs no ar, adiciona no JSON-LD do `LocalBusiness`:

```json
"sameAs": [
  "https://www.instagram.com/baltazarcustoms",
  "https://www.facebook.com/baltazarcustoms"
]
```

Liga a entidade aos perfis externos. Forte sinal pro Google e pros LLMs.

---

## Verificação final

Depois de todos os passos acima, roda o site nesses validators:

- **Rich Results Test** — https://search.google.com/test/rich-results — testa o JSON-LD
- **Lighthouse** (Chrome DevTools → Lighthouse) — alvo: Performance > 90, SEO 100, Accessibility > 90, Best Practices > 90
- **Schema Validator** — https://validator.schema.org/ — segunda opinião sobre o schema
- **Mobile-Friendly Test** — https://search.google.com/test/mobile-friendly

Se algum item ficar amarelo/vermelho, me avisa que eu ajusto.
