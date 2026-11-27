// Post today's new drafts (social/today.json, written by build.mjs) to the 民眾隊 FB Page and Threads.
// Default is a dry run that only prints. `node social/publish.mjs --send` really posts.
// `node social/publish.mjs --setup` swaps FB_PAGE_TOKEN for a non-expiring Page token (run once).
// Tokens live in ../.env (gitignored). social/published.json remembers what went out, so nothing posts twice.
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.dirname(new URL(import.meta.url).pathname);
const ENV = path.join(DIR, '..', '.env');
process.loadEnvFile(ENV);
const env = process.env;
const send = process.argv.includes('--send');
const FB = 'https://graph.facebook.com/v21.0';
const TH = 'https://graph.threads.net/v1.0';

async function call(url, params, method = 'GET') {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v != null));
  const res = await fetch(method === 'GET' ? `${url}?${q}` : url, method === 'GET' ? {} : { method, body: q });
  const j = await res.json();
  if (!res.ok || j.error) throw new Error(`${url.split('?')[0]}: ${j.error?.message || res.status}`);
  return j;
}
function saveEnv(key, value) {
  const s = fs.readFileSync(ENV, 'utf8');
  fs.writeFileSync(ENV, s.match(new RegExp(`^${key}=`, 'm')) ? s.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`) : `${s}${key}=${value}\n`);
}

if (process.argv.includes('--setup')) {
  // short-lived token → long-lived; if it was a user token, pick the 民眾隊 Page token (Page tokens from a long-lived user token don't expire)
  const long = (await call(`${FB}/oauth/access_token`, { grant_type: 'fb_exchange_token', client_id: env.META_APP_ID, client_secret: env.META_APP_SECRET, fb_exchange_token: env.FB_PAGE_TOKEN })).access_token;
  const pages = await call(`${FB}/me/accounts`, { access_token: long }).catch(() => null);
  const page = pages?.data?.find((p) => p.name === '民眾隊') || pages?.data?.[0];
  saveEnv('FB_PAGE_TOKEN', page ? page.access_token : long);
  const me = await call(`${FB}/me`, { fields: 'id,name', access_token: page ? page.access_token : long });
  console.log(`FB token saved for ${me.name} (${me.id})`);
  process.exit(0);
}

const today = JSON.parse(fs.readFileSync(path.join(DIR, 'today.json'), 'utf8'));
const doneFile = path.join(DIR, 'published.json');
const done = fs.existsSync(doneFile) ? JSON.parse(fs.readFileSync(doneFile, 'utf8')) : {};

// Threads long-lived tokens last 60 days; refreshing daily keeps them alive.
if (send && env.THREADS_TOKEN) {
  try { const r = await call(`${TH.replace('/v1.0', '')}/refresh_access_token`, { grant_type: 'th_refresh_token', access_token: env.THREADS_TOKEN }); saveEnv('THREADS_TOKEN', r.access_token); env.THREADS_TOKEN = r.access_token; }
  catch (e) { console.error('Threads token refresh failed:', e.message); }
}

// FB only renders a preview card when `link` is passed explicitly; Threads unfurls the URL in the text itself.
const targets = {
  fb: env.FB_PAGE_TOKEN && (async (text) => (await call(`${FB}/me/feed`, { message: text, link: text.match(/https:\/\/\S+$/)?.[0], access_token: env.FB_PAGE_TOKEN }, 'POST')).id),
  threads: env.THREADS_TOKEN && (async (text) => {
    const c = await call(`${TH}/me/threads`, { media_type: 'TEXT', text, access_token: env.THREADS_TOKEN }, 'POST');
    return (await call(`${TH}/me/threads_publish`, { creation_id: c.id, access_token: env.THREADS_TOKEN }, 'POST')).id;
  }),
};

let failed = 0;
for (const p of today) {
  for (const [name, post] of Object.entries(targets)) {
    const k = `${name}:${p.key}`;
    if (done[k]) continue;
    if (!post) { console.log(`[skip ${name}] no token`); continue; }
    if (!send) { console.log(`[dry-run ${name}] ${p.key}\n${p.text}\n`); continue; }
    try { done[k] = await post(p.text); console.log(`[posted ${name}] ${p.key} → ${done[k]}`); fs.writeFileSync(doneFile, JSON.stringify(done, null, 1) + '\n'); }
    catch (e) { failed++; console.error(`[fail ${name}] ${p.key}: ${e.message}`); }
  }
}
console.log(`${today.length} new today${send ? '' : ' (dry run, add --send to post)'}`);
process.exit(failed ? 1 : 0);
