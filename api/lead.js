// Vercel Serverless Function
// Recebe o formulário "Peça sua prancha" do site e envia por email via Resend.
//
// Configurar no Vercel (Project Settings -> Environment Variables):
//   RESEND_API_KEY  = a API key do Resend da Flowcode (re_...)   [obrigatório]
//   LEAD_TO         = para quem vai o email (default lucas.carmo@flowcode.cc)
//   LEAD_FROM       = remetente verificado no Resend
//                     (default "Baltazar Customs <pedidos@baltazarcustomssurfboards.com>")
//                     O domínio do FROM precisa estar verificado no Resend.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = {}; } }
    body = body || {};

    // honeypot anti-spam: bots preenchem campos escondidos
    if (body.website) { res.status(200).json({ ok: true }); return; }

    const clean = (v, n) => String(v == null ? '' : v).trim().slice(0, n || 200);
    const nome = clean(body.nome, 120);
    const contato = clean(body.contato, 160);
    if (!nome || !contato) {
      res.status(400).json({ ok: false, error: 'nome_e_contato_obrigatorios' });
      return;
    }

    const modelo = clean(body.modelo, 60);
    const altura = clean(body.altura, 10);
    const peso = clean(body.peso, 10);
    const nivel = clean(body.nivel, 40);
    const onda = clean(body.onda, 40);
    const mensagem = clean(body.mensagem, 2000);
    const origem = clean(body.origem, 300);

    // Referências: pranchas da coleção que o cliente juntou no site (máx. 8).
    // A foto é montada aqui a partir do caminho: /images/... vira link do site;
    // links https (fotos do bucket do Supabase) passam. Qualquer outra coisa é
    // descartada, então ninguém injeta endereço arbitrário no email.
    const SITE = (process.env.SITE_URL || 'https://www.baltazarcustomssurfboards.com').replace(/\/$/, '');
    const refs = (Array.isArray(body.referencias) ? body.referencias : []).slice(0, 8).map(function (r) {
      r = r || {};
      const raw = clean(r.imagem, 400);
      const img = /^https:\/\//.test(raw) ? raw
        : (/^\/images\/[A-Za-z0-9._\/-]+$/.test(raw) && raw.indexOf('..') < 0 ? SITE + raw : '');
      return {
        modelo: clean(r.modelo, 60),
        tamanho: clean(r.tamanho, 120),
        medidas: clean(r.medidas, 160),
        pintura: clean(r.pintura, 300),
        quilhas: clean(r.quilhas, 160),
        obs: clean(r.obs, 1000),
        detalhes: clean(r.detalhes, 160),
        imagem: img,
      };
    }).filter(function (r) { return r.modelo || r.imagem; });

    const KEY = process.env.RESEND_API_KEY;
    if (!KEY) { res.status(500).json({ ok: false, error: 'resend_nao_configurado' }); return; }
    // LEAD_TO aceita 1 ou vários emails separados por vírgula.
    // Padrão: Lucas (parceria) + César (shaper).
    const TO = (process.env.LEAD_TO || 'lucas.carmo@flowcode.cc, baltazarferro4@gmail.com')
      .split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    const FROM = process.env.LEAD_FROM || 'Baltazar Customs <pedidos@baltazarcustomssurfboards.com>';

    // Número de pedido legível: BC-AAAAMMDD-XXXX (data + 4 dígitos).
    var now = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var ymd = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
    var rand = Math.floor(1000 + Math.random() * 9000);
    var pedidoId = 'BC-' + ymd + '-' + rand;
    var recebidoEm = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }) + ' (Rio)';

    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const row = (k, v) => v
      ? `<tr><td style="padding:5px 14px 5px 0;color:#777;font:13px sans-serif;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:5px 0;font:13px sans-serif;color:#111"><strong>${esc(v)}</strong></td></tr>`
      : '';

    const html = `
      <div style="max-width:540px;margin:0 auto;font-family:sans-serif;color:#111">
        <p style="font:600 12px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#999;margin:0 0 2px">Baltazar Customs</p>
        <h2 style="font-size:20px;margin:0 0 2px">Pedido ${esc(pedidoId)}</h2>
        <p style="color:#777;font-size:13px;margin:0 0 18px">Recebido pelo formulário do site — ${esc(recebidoEm)}</p>
        <table style="border-collapse:collapse;width:100%">
          ${row('Pedido', pedidoId)}
          ${row('Recebido em', recebidoEm)}
          ${row('Nome', nome)}
          ${row('Contato', contato)}
          ${row('Tipo de prancha', modelo)}
          ${row('Altura', altura ? altura + ' cm' : '')}
          ${row('Peso', peso ? peso + ' kg' : '')}
          ${row('Nível', nivel)}
          ${row('Onda', onda)}
          ${row('Cupom informado', 'CARBON1000 (10%)')}
          ${row('Mensagem', mensagem)}
          ${row('Referências', refs.length ? refs.length + ' prancha(s), fotos abaixo' : '')}
          ${row('Origem', origem)}
        </table>
        ${refs.length ? `
        <p style="font:600 12px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#999;margin:26px 0 10px">Pranchas que o cliente curtiu</p>
        ${refs.map(function (r, i) {
          const spec = (k, v) => v ? `<tr><td style="padding:3px 12px 3px 0;color:#777;font:12px sans-serif;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:3px 0;font:12px sans-serif;color:#111"><strong>${esc(v)}</strong></td></tr>` : '';
          return `
        <table style="border-collapse:collapse;width:100%;margin:0 0 14px;border-top:1px solid #eee"><tr>
          <td style="padding:12px 14px 0 0;vertical-align:top;width:110px">
            ${r.imagem ? `<a href="${esc(r.imagem)}"><img src="${esc(r.imagem)}" width="100" style="display:block;width:100px;height:auto;border:0" alt="${esc(r.modelo)}"/></a>` : ''}
          </td>
          <td style="padding:12px 0 0;vertical-align:top">
            <div style="font:11px sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#999">Referência ${i + 1}</div>
            <div style="font:14px sans-serif;color:#111;margin:3px 0 2px"><strong>${esc(r.modelo)}</strong></div>
            <div style="font:12px sans-serif;color:#777;margin-bottom:8px">${esc(r.detalhes)}</div>
            <table style="border-collapse:collapse">
              ${spec('Tamanho', r.tamanho)}${spec('Medidas', r.medidas)}${spec('Pintura', r.pintura)}${spec('Quilhas', r.quilhas)}${spec('Observações', r.obs)}
            </table>
          </td>
        </tr></table>`; }).join('')}` : ''}
      </div>`;

    const text = [
      'Pedido ' + pedidoId + ' (site Baltazar Customs)',
      'Recebido em: ' + recebidoEm,
      '',
      'Nome: ' + nome,
      'Contato: ' + contato,
      modelo ? 'Tipo: ' + modelo : '',
      altura ? 'Altura: ' + altura + ' cm' : '',
      peso ? 'Peso: ' + peso + ' kg' : '',
      nivel ? 'Nível: ' + nivel : '',
      onda ? 'Onda: ' + onda : '',
      'Cupom: CARBON1000 (10%)',
      mensagem ? 'Mensagem: ' + mensagem : '',
      refs.length ? '\nReferências:\n' + refs.map(function (r, i) {
        return (i + 1) + '. ' + r.detalhes + (r.imagem ? ' - ' + r.imagem : '')
          + (r.tamanho ? '\n   Tamanho: ' + r.tamanho : '') + (r.medidas ? '\n   Medidas: ' + r.medidas : '')
          + (r.pintura ? '\n   Pintura: ' + r.pintura : '') + (r.quilhas ? '\n   Quilhas: ' + r.quilhas : '')
          + (r.obs ? '\n   Observações: ' + r.obs : '');
      }).join('\n') : '',
      origem ? 'Origem: ' + origem : '',
    ].filter(Boolean).join('\n');

    const looksEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contato);

    const payload = {
      from: FROM,
      to: TO,
      subject: 'Pedido ' + pedidoId + ' — ' + nome,
      html: html,
      text: text,
    };
    if (looksEmail) payload.reply_to = contato;

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      res.status(502).json({ ok: false, error: 'falha_envio', detail: detail.slice(0, 300) });
      return;
    }

    res.status(200).json({ ok: true, pedido: pedidoId });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'erro_interno' });
  }
};
