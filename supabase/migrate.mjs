// Baltazar Customs — migração para Supabase
// Uso (uma vez, local):
//   1) Pega a service_role key no painel: Project Settings → API → service_role (secret)
//   2) Exporta variáveis:
//        export SUPABASE_URL="https://eylnwwerbssfaaaxsccw.supabase.co"
//        export SUPABASE_SERVICE_ROLE_KEY="cola-aqui-a-service-role"
//   3) Da raiz do repo, roda:
//        node supabase/migrate.mjs
// Idempotente (upsert). Pode rodar de novo sem duplicar.
// IMPORTANTE: nunca commitar a service_role key. Ela é admin total do projeto.

import { readFileSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Faltando env. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

// ============================================================
// Catálogo (espelho do que está em index.html hoje)
// ============================================================
const CAT = {
  'Thruster':   'thruster',
  'Twin':       'twin',
  'Twin +1':    'twin-plus-1',
  'Quad':       'quad',
  'Mid-Length': 'mid-length',
  'Longboard':  'longboard',
  'Asymmetric': 'asymmetric',
  'Outras':     'outras',
};

const BOARDS = [
  // Lote antigo (IMG_*)
  { p:'IMG_6839.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6846.jpeg', c:'Thruster',   f:'Thruster' },
  { p:'IMG_6845.jpeg', c:'Longboard',  f:'Single' },
  { p:'IMG_6873.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6857.jpeg', c:'Mid-Length', f:'Single + Estab.' },
  { p:'IMG_6880.jpeg', c:'Quad',       f:'Quad' },
  { p:'IMG_6837.jpeg', c:'Twin',       f:'Twin Keel' },
  { p:'IMG_6853.jpeg', c:'Thruster',   f:'Thruster' },
  { p:'IMG_6844.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6868.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6876.jpeg', c:'Thruster',   f:'Thruster' },
  { p:'IMG_6883.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6858.jpeg', c:'Thruster',   f:'5 Caixas' },
  { p:'IMG_6852.jpeg', c:'Twin',       f:'Twin Keel' },
  { p:'IMG_6865.jpeg', c:'Quad',       f:'Quad' },
  { p:'IMG_6841.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6849.jpeg', c:'Thruster',   f:'Thruster' },
  { p:'IMG_6835.jpeg', c:'Twin',       f:'Twin', line:'Carbon Trash' },
  { p:'IMG_6884.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6856.jpeg', c:'Twin',       f:'Twin', line:'Carbon Trash' },
  { p:'IMG_6874.jpeg', c:'Thruster',   f:'Thruster' },
  { p:'IMG_6875.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6832.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6836.jpeg', c:'Twin',       f:'Twin', line:'Carbon Trash' },
  { p:'IMG_6838.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6840.jpeg', c:'Twin',       f:'Twin', line:'Carbon Trash' },
  { p:'IMG_6847.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6848.jpeg', c:'Twin',       f:'Twin', line:'Carbon Trash' },
  { p:'IMG_6855.jpeg', c:'Twin',       f:'Twin', line:'Carbon Trash' },
  { p:'IMG_6859.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6872.jpeg', c:'Twin',       f:'Twin' },
  { p:'IMG_6885.jpeg', c:'Twin',       f:'Twin' },
  // Lote junho/2026 (WhatsApp Cesar)
  { p:'baltazar/baltz-001.jpeg', c:'Outras',     f:'Variável' },
  { p:'baltazar/baltz-002.jpeg', c:'Twin',       f:'Twin' },
  { p:'baltazar/baltz-003.jpeg', c:'Thruster',   f:'Thruster' },
  { p:'baltazar/baltz-004.jpeg', c:'Mid-Length', f:'Single + Estab.' },
  { p:'baltazar/baltz-005.jpeg', c:'Longboard',  f:'Single' },
  { p:'baltazar/baltz-006.jpeg', c:'Mid-Length', f:'Single + Estab.' },
  { p:'baltazar/baltz-007.jpeg', c:'Twin',       f:'Twin' },
  { p:'baltazar/baltz-008.jpeg', c:'Quad',       f:'Quad' },
  { p:'baltazar/baltz-009.jpeg', c:'Twin',       f:'Twin' },
  { p:'baltazar/baltz-010.jpeg', c:'Twin',       f:'Twin' },
  { p:'baltazar/baltz-011.jpeg', c:'Twin',       f:'Twin Keel' },
  { p:'baltazar/baltz-012.jpeg', c:'Twin',       f:'Twin' },
  { p:'baltazar/baltz-013.jpeg', c:'Thruster',   f:'Thruster' },
  { p:'baltazar/baltz-014.jpeg', c:'Longboard',  f:'Single' },
  { p:'baltazar/baltz-015.jpeg', c:'Mid-Length', f:'Single + Estab.' },
  { p:'baltazar/baltz-016.jpeg', c:'Twin +1',    f:'Twin + Estab.' },
  { p:'baltazar/baltz-017.jpeg', c:'Longboard',  f:'Single' },
  { p:'baltazar/baltz-018.jpeg', c:'Mid-Length', f:'Single + Estab.' },
  { p:'baltazar/baltz-019.jpeg', c:'Twin',       f:'Twin' },
  { p:'baltazar/baltz-020.jpeg', c:'Mid-Length', f:'Single + Estab.' },
  { p:'baltazar/baltz-021.jpeg', c:'Longboard',  f:'Single' },
  { p:'baltazar/baltz-022.jpeg', c:'Twin',       f:'Twin' },
  { p:'baltazar/baltz-023.jpeg', c:'Twin',       f:'Twin' },
  { p:'baltazar/baltz-024.jpeg', c:'Outras',     f:'Variável' },
  { p:'baltazar/baltz-025.jpeg', c:'Thruster',   f:'Thruster' },
];

// ============================================================
// Helpers de Storage e REST
// ============================================================
async function uploadOne(localPath, remoteName) {
  if (!existsSync(localPath)) {
    console.warn('  SKIP (não achei o arquivo):', localPath);
    return false;
  }
  const buf = readFileSync(localPath);
  const r = await fetch(`${URL}/storage/v1/object/boards/${encodeURIComponent(remoteName)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: buf,
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`upload ${remoteName} → ${r.status}: ${t}`);
  }
  return true;
}

async function upsertBoardsBatch(rows) {
  const r = await fetch(`${URL}/rest/v1/boards?on_conflict=image_path`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      apikey: KEY,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`insert boards → ${r.status}: ${t}`);
  }
}

// ============================================================
// Migração
// ============================================================
async function main() {
  console.log(`Subindo ${BOARDS.length} imagens para storage:boards ...`);
  let uploaded = 0, skipped = 0;
  for (const b of BOARDS) {
    const local = join('images', b.p);
    const remote = basename(b.p);   // bucket flat: 'baltz-001.jpeg', 'IMG_6840.jpeg'
    const ok = await uploadOne(local, remote);
    if (ok) { uploaded++; process.stdout.write('.'); } else { skipped++; }
  }
  console.log(`\n  ${uploaded} ok, ${skipped} pulados`);

  console.log('Inserindo registros em public.boards ...');
  const rows = BOARDS.map((b, i) => ({
    image_path: basename(b.p),
    category_slug: CAT[b.c] || 'outras',
    fin_setup: b.f || null,
    line: b.line || null,
    sort_order: i,
    active: true,
  }));
  // upsert em lotes de 100
  for (let i = 0; i < rows.length; i += 100) {
    await upsertBoardsBatch(rows.slice(i, i + 100));
  }
  console.log(`  ${rows.length} registros gravados.`);
  console.log('\nFeito.');
}

main().catch(err => { console.error('ERRO:', err.message); process.exit(1); });
