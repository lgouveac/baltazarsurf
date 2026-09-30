// Busca uma prancha pelo link compartilhado (?prancha=<nome do arquivo da foto>)
// e devolve o que a prévia precisa: foto, modelo e detalhes.
// Usado pelo middleware (tags da prévia) e por /api/og (imagem da prévia).
// Arquivos em api/ que começam com "_" não viram rota no Vercel.

export const SITE = 'https://www.baltazarcustomssurfboards.com';
const SUPA = 'https://eylnwwerbssfaaaxsccw.supabase.co';
// Chave anônima: é pública, a mesma que o site usa para ler o catálogo.
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bG53d2VyYnNzZmFhYXhzY2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDU3NjYsImV4cCI6MjA5NzI4MTc2Nn0.XMYTNxGEj5Jjt89Q9GCQasnD9sR9q0lt4wdlXUNrJgc';
const H = { apikey: ANON, Authorization: 'Bearer ' + ANON };

export function cleanKey(k) {
  return String(k || '').replace(/[^A-Za-z0-9._-]/g, '').slice(0, 80);
}
function stem(p) {
  return String(p || '').split('/').pop().replace(/\.[a-z0-9]+$/i, '');
}
// Texto cadastrado todo em maiúsculas ('ROUND TAIL') vira 'Round Tail'.
function tidy(t) {
  t = String(t).trim();
  return /[a-z]/.test(t) ? t : t.toLowerCase().replace(/(^|[\s\-\/(])([a-zà-ú])/g, (m, a, b) => a + b.toUpperCase());
}
function same(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

export async function findBoard(key, origin) {
  key = cleanKey(key);
  if (!key) return null;
  try {
    const q = SUPA + '/rest/v1/boards?select=image_path,category_slug,fin_setup,line'
      + '&active=eq.true&image_path=ilike.*' + encodeURIComponent(key) + '.*&limit=10';
    const r = await fetch(q, { headers: H });
    if (!r.ok) return null;
    const b = (await r.json()).find(x => stem(x.image_path) === key);
    if (!b) return null;
    let cat = 'Outras';
    if (b.category_slug) {
      const c = await fetch(SUPA + '/rest/v1/categories?select=name&slug=eq.' + encodeURIComponent(b.category_slug), { headers: H });
      const rows = c.ok ? await c.json() : [];
      if (rows[0] && rows[0].name) cat = rows[0].name;
      // categoria cadastrada toda em minúsculas ('5 fins set up') vira '5 Fins Set Up'
      if (!/[A-Z]/.test(cat)) cat = cat.replace(/(^|\s)([a-zà-ú])/g, (m, a, b) => a + b.toUpperCase());
    }
    const p = b.image_path;
    const img = /^https?:/.test(p) ? p
      : p.charAt(0) === '/' ? (origin || SITE) + p
      : SUPA + '/storage/v1/object/public/boards/' + p;
    const carbon = /carbon/i.test((b.line || '') + ' ' + (b.fin_setup || ''));
    const details = [];
    if (b.line) details.push(tidy(b.line));
    // não repete a categoria nem 'Carbon Trash' (que já vai em destaque na prévia)
    if (b.fin_setup && !same(b.fin_setup, cat) && !(carbon && same(b.fin_setup, 'carbon trash'))) details.push(tidy(b.fin_setup));
    return { key, img, cat, details: details.join(' · '), carbon };
  } catch (e) {
    return null;
  }
}

export const COPY = {
  pt: { model: 'Modelo', made: 'Feita à mão no Recreio, Rio de Janeiro', reach: 'para o Brasil e o mundo', desc: 'Prancha feita à mão pela Baltazar Customs no Recreio, Rio de Janeiro. Cada uma é única, shapeada sob medida.' },
  en: { model: 'Model', made: 'Handmade in Recreio, Rio de Janeiro', reach: 'for Brazil and the world', desc: 'Surfboard handmade by Baltazar Customs in Recreio, Rio de Janeiro. Each one is unique, shaped to measure.' },
  es: { model: 'Modelo', made: 'Hecha a mano en Recreio, Río de Janeiro', reach: 'para Brasil y el mundo', desc: 'Tabla hecha a mano por Baltazar Customs en Recreio, Río de Janeiro. Cada una es única, a medida.' },
};
