// "De acordo" do cliente numa proposta.
// POST /api/proposta  { t: "<token>", nome: "Nome de quem aceitou", cores?: "...", quilhas?: "..." }
// cores e quilhas só valem quando a proposta deixa o cliente escolher (o banco decide).
// Registra o aceite no Supabase (função accept_proposal, que só grava uma vez)
// e avisa a equipe por email (Resend), com o resumo e o valor final.

const SUPA = 'https://eylnwwerbssfaaaxsccw.supabase.co';
// chave anônima (pública, a mesma do site): só consegue chamar as funções liberadas
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bG53d2VyYnNzZmFhYXhzY2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDU3NjYsImV4cCI6MjA5NzI4MTc2Nn0.XMYTNxGEj5Jjt89Q9GCQasnD9sR9q0lt4wdlXUNrJgc';
const SITE = 'https://www.baltazarcustomssurfboards.com';

const brl = (n) => 'R$ ' + Number(n || 0).toLocaleString('pt-BR');
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method_not_allowed' }); return; }
  try {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = {}; } }
    body = body || {};
    const t = String(body.t || '').trim();
    const nome = String(body.nome || '').trim().slice(0, 120);
    const cores = String(body.cores || '').trim().slice(0, 500);
    const quilhas = String(body.quilhas || '').trim().slice(0, 120);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) { res.status(400).json({ ok: false, error: 'token_invalido' }); return; }
    if (!nome) { res.status(400).json({ ok: false, error: 'nome_obrigatorio' }); return; }

    const r = await fetch(SUPA + '/rest/v1/rpc/accept_proposal', {
      method: 'POST',
      headers: { apikey: ANON, Authorization: 'Bearer ' + ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ t: t, nome: nome, cores: cores || null, quilhas: quilhas || null }),
    });
    if (!r.ok) { res.status(502).json({ ok: false, error: 'falha_registro' }); return; }
    const rows = await r.json();
    const p = rows && rows[0];
    if (!p) { res.status(404).json({ ok: false, error: 'proposta_nao_encontrada' }); return; }

    // email pra equipe (se o Resend falhar, o aceite já está registrado)
    const KEY = process.env.RESEND_API_KEY;
    if (KEY) {
      const TO = (process.env.LEAD_TO || 'lucas.carmo@flowcode.cc, baltazarferro4@gmail.com').split(',').map((x) => x.trim()).filter(Boolean);
      const FROM = process.env.LEAD_FROM || 'Baltazar Customs <pedidos@baltazarcustomssurfboards.com>';
      const quando = new Date(p.aceito_em || Date.now()).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }) + ' (Rio)';
      const row = (k, v) => v ? `<tr><td style="padding:5px 14px 5px 0;color:#777;font:13px sans-serif;vertical-align:top;white-space:nowrap">${k}</td><td style="padding:5px 0;font:13px sans-serif;color:#111"><strong>${esc(v)}</strong></td></tr>` : '';
      const html = `
        <div style="max-width:540px;margin:0 auto;font-family:sans-serif;color:#111">
          <p style="font:600 12px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#999;margin:0 0 2px">Baltazar Customs</p>
          <h2 style="font-size:20px;margin:0 0 2px">Proposta aceita: ${esc(p.cliente_nome)}</h2>
          <p style="color:#777;font-size:13px;margin:0 0 18px">${esc(p.aceito_nome || nome)} deu "de acordo" em ${esc(quando)}. Próximo passo: enviar o link de pagamento.</p>
          <table style="border-collapse:collapse;width:100%">
            ${row('Pedido', p.lead_pedido)}${row('Cliente', p.cliente_nome)}${row('Contato', p.cliente_contato)}
            ${row('Modelo', p.modelo)}${row('Tamanho', p.tamanho)}${row('Medidas', p.medidas)}
            ${row(p.escolhe_cores ? 'Cores (escolha do cliente)' : 'Pintura', p.escolhe_cores ? (p.escolha_cores || 'não informou') : p.pintura)}
            ${row(p.escolhe_quilhas ? 'Quilhas (escolha do cliente)' : 'Quilhas', p.escolhe_quilhas ? (p.escolha_quilhas || 'não informou') : p.quilhas)}
            ${row('Valor de tabela', brl(p.preco_tabela))}${row('Desconto', p.desconto_pct ? p.desconto_pct + '%' + (p.cupom ? ' (' + p.cupom + ')' : '') : '')}
            ${row('Valor final', brl(p.preco_final))}
          </table>
          <p style="margin:20px 0 0;font:13px sans-serif"><a href="${SITE}/proposta?t=${p.id}">Ver a proposta</a></p>
        </div>`;
      const text = [
        'Proposta aceita: ' + p.cliente_nome + (p.lead_pedido ? ' (' + p.lead_pedido + ')' : ''),
        (p.aceito_nome || nome) + ' deu "de acordo" em ' + quando + '.',
        'Próximo passo: enviar o link de pagamento.',
        '', 'Contato: ' + (p.cliente_contato || ''), 'Modelo: ' + p.modelo, 'Tamanho: ' + (p.tamanho || ''),
        p.escolhe_cores ? 'Cores escolhidas: ' + (p.escolha_cores || 'não informou') : '',
        p.escolhe_quilhas ? 'Quilhas escolhidas: ' + (p.escolha_quilhas || 'não informou') : '',
        'Valor final: ' + brl(p.preco_final), '', SITE + '/proposta?t=' + p.id,
      ].join('\n');
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: TO, subject: 'Proposta aceita — ' + p.cliente_nome + (p.lead_pedido ? ' (' + p.lead_pedido + ')' : ''), html: html, text: text }),
      }).catch(() => {});
    }

    res.status(200).json({ ok: true, status: p.status, aceito_em: p.aceito_em, aceito_nome: p.aceito_nome, escolha_cores: p.escolha_cores, escolha_quilhas: p.escolha_quilhas });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'erro_interno' });
  }
};
