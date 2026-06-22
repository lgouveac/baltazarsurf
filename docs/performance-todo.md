# Performance — itens pendentes
**O que ainda dá pra fazer pra subir Core Web Vitals e Lighthouse score.**

Já foi feito: preload do LCP, dimensões nas imagens-chave, lazy loading no grid de pranchas, preconnects, vercel.json com cache headers longos pra estáticos.

---

## 1. Compilar o Tailwind (~30 min, deploy mais complexo)

**Estado atual:** Tailwind CDN. ~300KB de JS rodando no browser pra gerar CSS dinamicamente. Funciona mas penaliza performance.

**Benefício de compilar:** CSS final fica ~15KB (apenas as classes usadas). Reduz LCP em ~500ms-1s em conexão lenta. Sobe muito o Lighthouse Performance.

**O que muda no deploy:**

1. `package.json`:

```json
{
  "name": "baltazarsurf",
  "scripts": {
    "build": "tailwindcss -i ./src/input.css -o ./public/styles.css --minify"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.0",
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/container-queries": "^0.1.1"
  }
}
```

2. `tailwind.config.js`:

```js
module.exports = {
  content: ['./*.html', './blog/**/*.html', './admin/**/*.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'on-surface-variant':'#474747','background':'#f9f9f9',
        'surface':'#f9f9f9','surface-container-low':'#f3f3f3',
        'surface-container':'#eeeeee','primary':'#000000',
        'on-background':'#1a1c1c','on-surface':'#1a1c1c'
      },
      fontFamily: { 'headline':['Newsreader'], 'body':['Work Sans'], 'label':['Work Sans'] },
      borderRadius: {'DEFAULT':'0px','lg':'0px','xl':'0px','full':'9999px'},
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')]
}
```

3. `src/input.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. Em todos os HTMLs, trocar:

```html
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
```

por:

```html
<link rel="stylesheet" href="/styles.css">
```

5. `vercel.json` — adicionar build command:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".",
  "cleanUrls": true,
  ...
}
```

**Risco:** se algo der errado, deploy quebra. Mitigation: testar `npm run build` local antes de pushar. E manter um commit anterior pronto pra rollback.

**Recomendo fazer depois que o site estiver no ar e estabilizado**, não junto com o launch.

---

## 2. WebP nas imagens estáticas

**Imagens estáticas no repo** (logo oval, tigre, surfer, OG image): 
- `images/brand/*.png` — tem transparência, então WebP traz ganho razoável (~30% menor que PNG)
- `images/IMG_*.jpeg` — já são JPEG, WebP ganha ~25-35% adicional

**Como gerar:** script Python com Pillow ou `cwebp` da Google. Ex:

```python
from PIL import Image
import glob
for p in glob.glob('images/**/*.png', recursive=True) + glob.glob('images/**/*.jpeg', recursive=True):
    im = Image.open(p)
    im.save(p.rsplit('.',1)[0] + '.webp', 'WEBP', quality=85)
```

**Como usar no HTML** (com fallback pra browser antigo):

```html
<picture>
  <source srcset="/images/brand/logo-oval-white.webp" type="image/webp">
  <img src="/images/brand/logo-oval-white.png" alt="Baltazar Customs">
</picture>
```

Trabalho: ~30 min se feito uma vez bem feito. Ganho real em mobile com conexão fraca.

---

## 3. Imagens do Supabase Storage (boards)

As fotos do catálogo vêm do Supabase Storage (bucket `boards`). Supabase tem transformação de imagem nativa:

```
{SUPABASE_URL}/storage/v1/render/image/public/boards/{path}?width=500&height=500&resize=cover
```

**Benefício:** thumbnails geradas no servidor. Não precisa baixar a foto inteira pra mostrar no grid.

**Como implementar:** no `index.html` onde monta o `<img src="..."`, adicionar query params com tamanho. Algo tipo:

```js
const IMG = SUPABASE_URL + '/storage/v1/render/image/public/boards/';
// ...
'<img src="' + IMG + b.image_path + '?width=600&quality=75" ...>'
```

**Atenção:** o `render/image` exige plano Pro do Supabase. No free, só dá pra usar o `object/public/` direto (sem transform). Se virar plano Pro, vale ativar.

---

## 4. Preload condicional do CSS de fonte

`Newsreader` e `Work Sans` vêm do Google Fonts. Já tem `preconnect` mas pode acelerar mais com:

```html
<link rel="preload" href="https://fonts.gstatic.com/s/newsreader/v26/cY9kfjOCX1hbuyalUrK439vogqC9yFZCYg7oRZaLP4obnf7fTXglsMwoT-ZA.ttf" as="font" type="font/ttf" crossorigin>
```

Mas a URL muda quando Google atualiza a versão da fonte. Frágil. Não recomendo essa otimização específica — o preconnect que já existe resolve 80% do problema.

---

## 5. Resumo de impacto vs esforço

| Item | Esforço | Ganho LCP | Risco |
|---|---|---|---|
| Compilar Tailwind | médio | -500ms~1s | médio (precisa testar deploy) |
| WebP estáticas | baixo | -100ms | baixo |
| Supabase image transform | baixo | -200ms | baixo (precisa Supabase Pro) |
| Preload fonts | baixo | -50ms | médio (frágil) |

**Ordem recomendada:** primeiro deixa o site rodar uma semana com analytics ligado e identifica o gargalo real via Vercel Speed Insights. Depois decide qual otimização atacar.
