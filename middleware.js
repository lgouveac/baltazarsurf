// Prévia por prancha. Quem monta a prévia de um link (WhatsApp, Instagram,
// iMessage, Facebook...) não roda JavaScript: lê só o HTML. Quando o link tem
// ?prancha=, este middleware devolve a mesma página com as tags de prévia
// apontando para a foto e o nome daquela prancha (imagem gerada em /api/og).
// Roda antes dos arquivos estáticos; sem ?prancha= não faz nada.
import { next } from '@vercel/edge';
import { findBoard, cleanKey, COPY } from './api/_board.js';

export const config = { matcher: ['/', '/index.html', '/en', '/en/', '/en/index.html', '/es', '/es/', '/es/index.html'] };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
function setMeta(html, attr, name, value) {
  const re = new RegExp('(<meta ' + attr + '="' + name.replace(/:/g, '\\:') + '" content=")[^"]*(")');
  return re.test(html) ? html.replace(re, '$1' + esc(value) + '$2')
    : html.replace('</head>', '<meta ' + attr + '="' + name + '" content="' + esc(value) + '"/>\n</head>');
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const key = cleanKey(url.searchParams.get('prancha'));
  if (!key) return next();
  const lang = url.pathname.startsWith('/en') ? 'en' : url.pathname.startsWith('/es') ? 'es' : 'pt';
  const t = COPY[lang];
  try {
    const board = await findBoard(key, url.origin);
    if (!board) return next();
    const page = await fetch(url.origin + (lang === 'pt' ? '/' : '/' + lang), { headers: { 'x-baltazar-preview': '1' } });
    if (!page.ok) return next();
    let html = await page.text();
    const title = (board.carbon ? 'Carbon Trash · ' : t.model + ' ') + board.cat + ' | Baltazar Customs';
    const desc = (board.details ? board.details + '. ' : '') + t.desc;
    const shareUrl = url.origin + (lang === 'pt' ? '/' : '/' + lang) + '?prancha=' + encodeURIComponent(key);
    const img = url.origin + '/api/og?prancha=' + encodeURIComponent(key) + '&lang=' + lang;
    html = setMeta(html, 'property', 'og:title', title);
    html = setMeta(html, 'property', 'og:description', desc);
    html = setMeta(html, 'property', 'og:url', shareUrl);
    html = setMeta(html, 'property', 'og:image', img);
    html = setMeta(html, 'property', 'og:image:type', 'image/png');
    html = setMeta(html, 'property', 'og:image:alt', title);
    html = setMeta(html, 'name', 'twitter:title', title);
    html = setMeta(html, 'name', 'twitter:description', desc);
    html = setMeta(html, 'name', 'twitter:image', img);
    html = html.replace(/<title>[^<]*<\/title>/, '<title>' + esc(title) + '</title>');
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (e) {
    return next();
  }
}
