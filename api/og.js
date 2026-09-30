// Imagem da prévia (Open Graph) de uma prancha: 1200x630 com a foto da
// prancha escolhida, o modelo e a marca. Gerada na hora e guardada em cache.
// GET /api/og?prancha=<chave>&lang=pt|en|es
import { ImageResponse } from '@vercel/og';
import { findBoard, cleanKey, COPY } from './_board.js';

export const config = { runtime: 'edge' };

const h = (type, style, children) => ({ type, props: { style, children } });

export default async function handler(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const lang = COPY[url.searchParams.get('lang')] ? url.searchParams.get('lang') : 'pt';
  const t = COPY[lang];
  const board = await findBoard(cleanKey(url.searchParams.get('prancha')), origin);
  if (!board) return Response.redirect(origin + '/images/og-cover.jpg', 302);

  const font = f => fetch(origin + '/fonts/' + f).then(r => r.arrayBuffer());
  const [serif, sans, sansMed] = await Promise.all([font('newsreader-400.woff'), font('work-sans-400.woff'), font('work-sans-500.woff')]);

  const eyebrow = board.carbon ? 'Carbon Trash' : t.model;
  const tree = h('div', { width: '100%', height: '100%', display: 'flex', background: '#f5f3ef', color: '#141414' }, [
    h('div', { width: 820, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px' }, [
      { type: 'img', props: { src: origin + '/images/brand/logo-oval-black.png', height: 70, style: { height: 70, width: 164 } } },
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { fontFamily: 'Work Sans', fontWeight: 500, fontSize: 20, letterSpacing: 5, textTransform: 'uppercase', color: '#7a7a7a' }, eyebrow),
        h('div', { fontFamily: 'Newsreader', fontSize: 104, lineHeight: 1, letterSpacing: -3, marginTop: 14 }, board.cat),
        board.details ? h('div', { fontFamily: 'Work Sans', fontSize: 30, color: '#4a4a4a', marginTop: 22 }, board.details) : h('div', {}, ''),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', fontFamily: 'Work Sans', fontSize: 20, color: '#6a6a6a', letterSpacing: 1 }, [
        h('div', {}, t.made),
        h('div', { marginTop: 4 }, t.reach),
      ]),
    ]),
    h('div', { width: 380, height: '100%', display: 'flex', background: '#1a1a1a' }, [
      { type: 'img', props: { src: board.img, width: 380, height: 630, style: { width: 380, height: 630, objectFit: 'cover' } } },
    ]),
  ]);

  return new ImageResponse(tree, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Newsreader', data: serif, weight: 400, style: 'normal' },
      { name: 'Work Sans', data: sans, weight: 400, style: 'normal' },
      { name: 'Work Sans', data: sansMed, weight: 500, style: 'normal' },
    ],
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
  });
}
