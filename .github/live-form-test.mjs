// Teste de ponta a ponta no SITE AO VIVO: abre a coleção, adiciona uma
// referência, vai pro formulário e envia um pedido de teste de verdade.
// Roda nos servidores do GitHub (têm internet). Manda email real pra equipe.
import { chromium } from 'playwright';
const SITE = process.env.SITE || 'https://www.baltazarcustomssurfboards.com';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
let api = null;
p.on('response', async r => { if (r.url().includes('/api/lead')) api = { status: r.status(), body: await r.text().catch(() => '') }; });
const log = (ok, msg) => console.log((ok ? 'PASS  ' : 'FALHOU') + '  ' + msg);
let fails = 0; const check = (c, m) => { log(c, m); if (!c) fails++; };

await p.goto(SITE + '/', { waitUntil: 'networkidle', timeout: 60000 });
await p.screenshot({ path: 'live-1-home.png' });
const cards = await p.locator('#boardGrid > div').count();
check(cards > 0, `coleção carregou do Supabase (${cards} cards)`);

if (cards > 0) {
  await p.locator('#boardGrid > div').first().click();
  await p.waitForTimeout(800);
  const title = await p.textContent('#modalTitleDesktop');
  check(/^Modelo /.test(title), `carrossel abre com o modelo ("${title}")`);
  await p.locator('.lb-ref:visible').click();
  await p.waitForTimeout(500);
  check((await p.textContent('#refsToastMsg')).includes('formulário'), 'aviso de referência aparece');
  await p.screenshot({ path: 'live-2-referencia.png' });
  await p.locator('#boardModal button:has-text("Quero Minha Prancha"):visible').first().click();
  await p.waitForTimeout(1500);
  check(await p.locator('#refsList > div').count() >= 1, 'referência aparece no formulário');

  // completa 3 referências pelo seletor do próprio formulário
  const alvo = Number(process.env.REFS || 3);
  await p.locator('#refsPickBtn').click();
  await p.waitForTimeout(800);
  const livres = p.locator('#refsPickerGrid > button[aria-pressed="false"]');
  while ((await p.locator('#refsList > div').count()) < alvo && (await livres.count()) > 0) {
    await livres.first().click();
    await p.waitForTimeout(300);
  }
  const refs = await p.locator('#refsList p').allTextContents();
  console.log('Referências escolhidas:'); refs.forEach(r => console.log('   ' + r));
  check(refs.length === alvo, `${alvo} referências no formulário`);

  // responde as 4 perguntas de cada referência (mistura texto e atalhos)
  const cards = p.locator('#refsList .ref-card');
  for (let i = 0; i < await cards.count(); i++) {
    const c = cards.nth(i);
    await c.locator('input[data-spec="tamanho"]').fill(i === 0 ? "5'10\"" : '');
    if (i !== 0) await c.locator('input[data-spec="tamanho"] + div button', { hasText: 'Igual à referência' }).click();
    await c.locator('input[data-spec="medidas"] + div button', { hasText: 'O shaper decide' }).click();
    await c.locator('input[data-spec="pintura"]').fill(i === 0 ? 'Carbon Trash nos rails, deck branco' : 'Sem pintura');
    await c.locator('input[data-spec="quilhas"] + div button', { hasText: 'Igual à referência' }).click();
    if (i === 0) await c.locator('textarea[data-spec="obs"]').fill('Teste: bico um pouco mais fino que a referência.');
  }
  await p.screenshot({ path: 'live-2b-refs.png' });
}

await p.fill('#leadForm input[name=nome]', 'TESTE com referências (pode ignorar)');
await p.fill('#leadForm input[name=contato]', 'lucas.carmo@flowcode.cc');
await p.fill('#leadForm textarea[name=mensagem]', 'Pedido de teste enviado pelo Playwright no GitHub Actions para validar o formulário ao vivo.');
await p.locator('#leadSubmit').click();
await p.waitForFunction(() => /Recebido|Não consegui/.test(document.getElementById('leadArea').innerText), null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(500);
await p.screenshot({ path: 'live-3-envio.png', fullPage: false });
const area = await p.innerText('#leadArea');
console.log('\nResposta da API /api/lead:', api ? `HTTP ${api.status} ${api.body}` : '(nenhuma)');
const pedido = (area.match(/BC-\d{8}-\d{4}/) || [])[0];
check(!!pedido, pedido ? `pedido enviado: ${pedido}` : 'pedido NÃO foi enviado: ' + area.replace(/\s+/g, ' ').slice(0, 160));
check(errs.length === 0, 'sem erro de JavaScript' + (errs.length ? ': ' + errs.join(' | ') : ''));
await b.close();
console.log(`\n${fails ? 'FALHOU' : 'TUDO OK'} (${fails} falha(s))`);
process.exit(fails ? 1 : 0);
