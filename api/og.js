// Artes de uma prancha, geradas na hora e guardadas em cache:
//   format=link  (padrão) 1200x630  prévia de link (WhatsApp, iMessage...)
//   format=story          1080x1920 Instagram Stories
//   format=feed           1080x1350 Instagram Feed (4:5)
// GET /api/og?prancha=<chave>&lang=pt|en|es&format=link|story|feed
import { ImageResponse } from '@vercel/og';
import { findBoard, cleanKey, COPY } from './_board.js';

export const config = { runtime: 'edge' };

const h = (type, style, children) => ({ type, props: { style, children } });
const img = (src, style) => ({ type: 'img', props: { src, width: style.width, height: style.height, style } });
const SIZES = { link: [1200, 630], story: [1080, 1920], feed: [1080, 1350] };

// Prévia de link: texto à esquerda, foto à direita.
function linkArt(o, b, t, eyebrow) {
  return h('div', { width: '100%', height: '100%', display: 'flex', background: '#f5f3ef', color: '#141414' }, [
    h('div', { width: 820, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '56px 64px' }, [
      img(o + '/images/brand/logo-oval-black.png', { width: 164, height: 70 }),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { fontFamily: 'Work Sans', fontWeight: 500, fontSize: 20, letterSpacing: 5, textTransform: 'uppercase', color: '#7a7a7a' }, eyebrow),
        h('div', { fontFamily: 'Newsreader', fontSize: 104, lineHeight: 1, letterSpacing: -3, marginTop: 14 }, b.cat),
        b.details ? h('div', { fontFamily: 'Work Sans', fontSize: 30, color: '#4a4a4a', marginTop: 22 }, b.details) : h('div', {}, ''),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', fontFamily: 'Work Sans', fontSize: 20, color: '#6a6a6a', letterSpacing: 1 }, [
        h('div', {}, t.made),
        h('div', { marginTop: 4 }, t.reach),
      ]),
    ]),
    h('div', { width: 380, height: '100%', display: 'flex', background: '#1a1a1a' }, [
      img(b.img, { width: 380, height: 630, objectFit: 'cover' }),
    ]),
  ]);
}

// Stories: foto em tela cheia, logo no topo, texto embaixo. Mantém o conteúdo
// fora das faixas que o Instagram cobre (~250px no topo e ~300px embaixo).
function storyArt(o, b, t, eyebrow) {
  return h('div', { width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#111', color: '#fff' }, [
    img(b.img, { position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, objectFit: 'cover' }),
    h('div', { position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, display: 'flex',
      backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.88) 82%, rgba(0,0,0,0.92) 100%)' }, ''),
    h('div', { position: 'absolute', top: 250, left: 0, width: 1080, display: 'flex', justifyContent: 'center' }, [
      img(o + '/images/brand/logo-oval-white.png', { width: 300, height: 128 }),
    ]),
    h('div', { position: 'absolute', left: 96, right: 96, bottom: 330, display: 'flex', flexDirection: 'column' }, [
      h('div', { fontFamily: 'Work Sans', fontWeight: 500, fontSize: 34, letterSpacing: 9, textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)' }, eyebrow),
      h('div', { fontFamily: 'Newsreader', fontSize: 150, lineHeight: 1, letterSpacing: -4, marginTop: 18 }, b.cat),
      b.details ? h('div', { fontFamily: 'Work Sans', fontSize: 46, color: 'rgba(255,255,255,0.9)', marginTop: 26 }, b.details) : h('div', {}, ''),
      h('div', { display: 'flex', flexDirection: 'column', marginTop: 56, fontFamily: 'Work Sans', fontSize: 30, letterSpacing: 1, color: 'rgba(255,255,255,0.72)' }, [
        h('div', {}, t.made),
        h('div', { marginTop: 6 }, 'baltazarcustomssurfboards.com'),
      ]),
    ]),
  ]);
}

// Feed 4:5: texto à esquerda, foto da prancha inteira à direita.
function feedArt(o, b, t, eyebrow) {
  return h('div', { width: '100%', height: '100%', display: 'flex', background: '#f5f3ef', color: '#141414' }, [
    h('div', { width: 570, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '80px 56px 72px 72px' }, [
      img(o + '/images/brand/logo-oval-black.png', { width: 220, height: 94 }),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        h('div', { fontFamily: 'Work Sans', fontWeight: 500, fontSize: 26, letterSpacing: 7, textTransform: 'uppercase', color: '#7a7a7a' }, eyebrow),
        h('div', { fontFamily: 'Newsreader', fontSize: 112, lineHeight: 1, letterSpacing: -3, marginTop: 18 }, b.cat),
        b.details ? h('div', { fontFamily: 'Work Sans', fontSize: 34, color: '#4a4a4a', marginTop: 28, lineHeight: 1.35 }, b.details) : h('div', {}, ''),
      ]),
      h('div', { display: 'flex', flexDirection: 'column', fontFamily: 'Work Sans', fontSize: 22, color: '#6a6a6a' }, [
        h('div', {}, t.made),
        h('div', { marginTop: 4 }, t.reach),
        h('div', { marginTop: 22, color: '#141414' }, 'baltazarcustomssurfboards.com'),
      ]),
    ]),
    h('div', { width: 510, height: '100%', display: 'flex', background: '#1a1a1a' }, [
      img(b.img, { width: 510, height: 1350, objectFit: 'cover' }),
    ]),
  ]);
}

export default async function handler(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const lang = COPY[url.searchParams.get('lang')] ? url.searchParams.get('lang') : 'pt';
  const format = SIZES[url.searchParams.get('format')] ? url.searchParams.get('format') : 'link';
  const t = COPY[lang];
  const board = await findBoard(cleanKey(url.searchParams.get('prancha')), origin);
  if (!board) return Response.redirect(origin + '/images/og-cover.jpg', 302);

  const font = f => fetch(origin + '/fonts/' + f).then(r => r.arrayBuffer());
  const [serif, sans, sansMed] = await Promise.all([font('newsreader-400.woff'), font('work-sans-400.woff'), font('work-sans-500.woff')]);

  const eyebrow = board.carbon ? 'Carbon Trash' : t.model;
  const art = format === 'story' ? storyArt : format === 'feed' ? feedArt : linkArt;
  const [width, height] = SIZES[format];

  return new ImageResponse(art(origin, board, t, eyebrow), {
    width,
    height,
    fonts: [
      { name: 'Newsreader', data: serif, weight: 400, style: 'normal' },
      { name: 'Work Sans', data: sans, weight: 400, style: 'normal' },
      { name: 'Work Sans', data: sansMed, weight: 500, style: 'normal' },
    ],
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
  });
}
