// Vercel Serverless Function
// Recebe o formulário "Peça sua prancha" do site e envia por email via Resend.
//
// Configurar no Vercel (Project Settings -> Environment Variables):
//   RESEND_API_KEY  = a API key do Resend da Flowcode (re_...)   [obrigatório]
//   LEAD_TO         = para quem vai o email (default lucas.carmo@flowcode.cc)
//   LEAD_FROM       = remetente verificado no Resend
//                     (default "Baltazar Site <pedidos@flowcode.cc>")
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

    const KEY = process.env.RESEND_API_KEY;
    if (!KEY) { res.status(500).json({ ok: false, error: 'resend_nao_configurado' }); return; }
    // LEAD_TO aceita 1 ou vários emails separados por vírgula (depois é só
    // adicionar o email do César: "lucas.carmo@flowcode.cc, cesar@...").
    const TO = (process.env.LEAD_TO || 'lucas.carmo@flowcode.cc')
      .split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    const FROM = process.env.LEAD_FROM || 'Baltazar Site <pedidos@flowcode.cc>';

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
          ${row('Origem', origem)}
        </table>
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
