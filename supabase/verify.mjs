// Verifica o estado real do Supabase. Lê supabase/.env.local.
// Roda quando houver rede (sandbox liberada, ou no PC do Lucas): node supabase/verify.mjs
import fs from 'node:fs';
import path from 'node:path';
const envPath = path.join(path.dirname(new URL(import.meta.url).pathname), '.env.local');
const env = Object.fromEntries(fs.readFileSync(envPath,'utf8')
  .split('\n').filter(l=>l.includes('=') && !l.trim().startsWith('#'))
  .map(l=>{const i=l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const SUPA = env.SUPABASE_URL, KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!KEY || KEY.startsWith('COLE_')) { console.log('❌ Cole a service_role em supabase/.env.local primeiro.'); process.exit(1); }
const h = { apikey: KEY, Authorization: 'Bearer ' + KEY };
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5bG53d2VyYnNzZmFhYXhzY2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDU3NjYsImV4cCI6MjA5NzI4MTc2Nn0.XMYTNxGEj5Jjt89Q9GCQasnD9sR9q0lt4wdlXUNrJgc';
try {
  const t = await fetch(SUPA+'/rest/v1/boards?select=id', { headers:{...h,'Prefer':'count=exact','Range':'0-0'} });
  const total = (t.headers.get('content-range')||'?/?').split('/')[1];
  const a = await fetch(SUPA+'/rest/v1/boards?select=id&active=eq.true', { headers:{...h,'Prefer':'count=exact','Range':'0-0'} });
  const ativas = (a.headers.get('content-range')||'?/?').split('/')[1];
  const anonR = await fetch(SUPA+'/rest/v1/boards?select=id&limit=1', { headers:{ apikey:ANON, Authorization:'Bearer '+ANON } });
  const anonBody = await anonR.json().catch(()=>null);
  const anonLidas = Array.isArray(anonBody) ? anonBody.length : ('ERRO '+JSON.stringify(anonBody));
  console.log('== BOARDS (service_role, ignora RLS) ==\n  total:', total, '| ativas:', ativas);
  console.log('== O QUE O SITE (anon) LÊ ==\n  status:', anonR.status, '| linhas:', anonLidas);
  if (String(total)==='0') console.log('\n>>> tabela VAZIA — rodar supabase/seed-boards.sql');
  else if (anonLidas===0) console.log('\n>>> dados existem, mas RLS bloqueia o site — rodar o fix de RLS');
  else console.log('\n>>> site consegue ler; se aparece vazio é deploy/cache (Ctrl+Shift+R)');
} catch(e) { console.log('❌ Sem rede pro Supabase daqui:', String(e).split('\n')[0]); }
