// teamtpp static site builder. No dependencies: `node build.mjs` writes dist/.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const DIST = path.join(ROOT, 'dist');
const MAJOR = [['huang-ching-ying', 0], ['chen-shih-hsuan', 8], ['lin-chen-yu', 2], ['chen-yu-cheng', 6], ['chang-chih-hao', 1], ['sung-pin-ying', 3], ['chiang-ho-shu', 1], ['lin-shuo-yen', 1], ['wu-wei-ta', 0], ['li-kuo-chang', 2]];
const CITIES = ['台北', '新北', '基隆', '桃園', '新竹縣', '新竹市', '苗栗', '台中', '彰化', '南投', '雲林', '嘉義縣', '嘉義市', '台南', '高雄', '屏東', '宜蘭', '花蓮', '台東', '澎湖', '金門', '連江'];
const SITE = { name: '民眾隊', url: 'https://teamtpp.com' };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isVid = (u) => u.includes('youtube.com') || u.includes('youtu.be');
const sortKey = (d) => d.src || d.when;

const ICONS = {
  Facebook: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  Instagram: 'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z',
  Threads: 'M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z',
  YouTube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  TikTok: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'
};
const PLAY = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="#0B2F33"/></svg>';

const head = ({ title, desc, image, url }) => `<!doctype html>
<html lang="zh-Hant-TW">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
<meta name="theme-color" content="#F4F1EA">
<meta property="og:site_name" content="民眾隊 teamtpp.com">
<meta property="og:locale" content="zh_TW">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
${image ? `<meta property="og:image" content="${esc(SITE.url + image)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
${image ? `<meta name="twitter:image" content="${esc(SITE.url + image)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Serif+TC:wght@700;900&display=swap" rel="stylesheet">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/site.css">
</head>`;

const planCard = (it, attrs, pron) => `<article ${attrs}>
<div class="ar-body">
<p class="place">${esc(it.cat)}</p>
<h2 class="ttl">${esc(it.title)}</h2>
<div class="ba">
${it.now ? `<div class="b"><div class="tag">現在</div><p class="long plan">${esc(it.now)}</p></div>` : ''}
<div class="a"><div class="tag">${esc(pron)}要做</div><p class="long plan">${esc(it.plan)}</p></div>
</div>
<p class="src"><a href="${esc(it.url)}" target="_blank" rel="noopener">出處</a></p>
</div>
</article>`;
// ballot tag: candidates 「6 號・11/28 投票」, incumbents running again 「…爭取連任」
// 11/28 ballot: red double-ring number + 「縣市／第N選區」 block with town list
const CITYFULL = { 台北: '台北市', 新北: '新北市', 基隆: '基隆市', 桃園: '桃園市', 台中: '台中市', 台南: '台南市', 高雄: '高雄市', 苗栗: '苗栗縣', 彰化: '彰化縣', 南投: '南投縣', 雲林: '雲林縣', 屏東: '屏東縣', 宜蘭: '宜蘭縣', 花蓮: '花蓮縣', 澎湖: '澎湖縣', 金門: '金門縣' };
const zhNum = (n) => (n >= 20 ? '二' : '') + (n >= 10 ? '十' : '') + ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][n % 10];
const ballotNo = (d, size) => `<span class="bn bn-${size}" aria-label="${esc(d.person.ballot)} 號">${esc(d.person.ballot)}</span>`;
const distBox = (d) => {
  const p = d.person; const city = CITYFULL[p.electCity] || p.electCity;
  return `<span class="dist"><span class="dl"><b>${esc(city)}</b><span>${p.indig ? `${esc(p.indig)}選區` : `第${zhNum(p.district)}選區`}</span></span><span class="da">${p.indig ? (city.endsWith('縣') ? '全縣' : '全市') : esc(p.areas.join('、'))}</span></span>`;
};
const ballotTag = (d) => d.person.ballot ? `${d.person.ballot} 號・${d.person.election} ${d.kind === 'candidate' || d.kind === 'mayor-candidate' ? '投票' : '爭取連任'}` : '';

function personPage(d) {
  const p = d.person;
  const items = [...d.items].sort((a, b) => (sortKey(a) < sortKey(b) ? 1 : sortKey(a) > sortKey(b) ? -1 : 0));
  const mayor = d.kind === 'mayor-candidate';
  const cand = d.kind === 'candidate' || mayor;
  const first = d.personas[0];
  const firstItems = (cand ? d.platform : items).filter((it) => it.who.includes(first.id));
  const url = `${SITE.url}/${d.slug}/`;
  const title = `${p.name}｜${p.office}｜${SITE.name} teamtpp.com`;
  const desc = d.pitch.slice(0, 3).join('；');
  const page = { slug: d.slug, name: p.name, office: p.office, personas: d.personas };

  return `${head({ title, desc, image: d.portrait, url })}
<body>
<header class="hd"><div class="wrap hdr">
<a class="hdt brand" href="/"><img class="logo" src="/img/logo.png" alt="">${SITE.name}</a><span class="dot" aria-hidden="true"></span>
<span class="hdt">${esc(p.office)}</span><span class="dot" aria-hidden="true"></span>
<span class="hdt">${esc(p.name)}</span>

</div></header>

<section class="pitch"><div class="wrap pitch-in">
<div class="pf">
<img src="${esc(d.portrait)}" alt="${esc(p.name)}" class="portrait" width="300" height="300">
<nav aria-label="官方連結" class="links">
${d.links.map((l) => `<a class="lk" href="${esc(l.url)}" aria-label="${esc(l.label)}" title="${esc(l.label)}" target="_blank" rel="noopener"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[l.label] || ''}" fill="currentColor"/></svg></a>`).join('\n')}
</nav>
</div>
<div class="pitch-txt">
${cand ? `<div class="ballot">${ballotNo(d, 'l')}<div class="ballot-r"><p class="bl">${mayor ? esc(p.office.replace('參選人', '')) : esc(CITYFULL[p.electCity] || p.electCity) + '議員'}候選人</p><p class="cn">${esc(p.name)}</p>${mayor ? '' : distBox(d)}</div></div>` : ''}
${cand ? `<p class="bio">${esc(d.bio)}</p>` : ''}
<h2 id="pitch">怎麼跟朋友推薦${esc(p.pron)}</h2>
<ul>${d.pitch.map((t) => `<li><span class="bul" aria-hidden="true"></span><span>${esc(t)}</span></li>`).join('')}</ul>
</div>
</div></section>

<section><div class="wrap hero">
<div class="hero-l">
<h1>你是哪一種<br>${esc(p.local)}？</h1>
<div role="group" aria-label="選擇你的身分" class="personas">
${d.personas.map((x, i) => `<button type="button" class="pp" data-id="${esc(x.id)}" aria-pressed="${i === 0}"><span class="pl">${esc(x.label)}</span><span class="ps">${esc(x.sub)}</span></button>`).join('\n')}
</div>
<div class="answer"><span class="lead" id="lead">${esc(first.lead)}</span><span class="cnt" id="cnt">${firstItems.length}</span><span class="lead">${cand ? `項${esc(p.pron)}的政見` : `個${esc(p.pron)}改過的地方`}</span></div>
</div>
${cand ? '' : `<div class="fan" aria-hidden="true">
${[0, 1, 2].map((i) => `<img class="f f${i}" src="${esc(firstItems[i]?.thumb || '')}" alt=""${firstItems[i] ? '' : ' hidden'}>`).join('')}
</div>`}
</div></section>

<main class="wrap mn">
<div id="items">
${cand ? d.platform.map((it, i) => planCard(it, `class="ar" id="i-${i}" data-who="${esc(it.who.join(' '))}" data-i="${i}"${it.who.includes(first.id) ? '' : ' hidden'}`, p.pron)).join('\n') : items.map((it, i) => `<article class="ar" id="i-${d.items.indexOf(it)}" data-who="${esc(it.who.join(' '))}" data-i="${i}"${it.who.includes(first.id) ? '' : ' hidden'}>
<a class="th" href="${esc(it.url)}" target="_blank" rel="noopener" aria-label="${isVid(it.url) ? '觀看影片' : '看貼文'}：${esc(it.title)}"><img src="${esc(it.thumb)}" alt="" loading="lazy">${isVid(it.url) ? `<span class="play">${PLAY}</span>` : ''}</a>
<div class="ar-body">
<p class="place">${esc(it.place)}</p>
<h2 class="ttl">${esc(it.title)}</h2>
<div class="ba">
<div class="b"><div class="tag">以前</div><p class="short">${esc(it.bShort)}</p><p class="long">${esc(it.before)}</p></div>
<div class="mid"><svg width="44" height="24" viewBox="0 0 44 24" aria-hidden="true"><path d="M2 12h36M28 3l10 9-10 9" fill="none" stroke="#141414" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="when">${esc(it.when)}</span><span class="st">${esc(it.status)}</span></div>
<div class="a"><div class="tag">現在</div><p class="short">${esc(it.aShort)}</p><p class="long">${esc(it.after)}</p></div>
</div>
<button type="button" class="sb" data-i="${i}">下載分享圖卡</button>
</div>
</article>`).join('\n')}
</div>

${d.duo && d.duo.length ? `<div class="duo">
${d.duo.map((x) => `<article><a class="duo-a" href="${esc(x.url)}" target="_blank" rel="noopener" aria-label="觀看影片：${esc(x.title)}"><img src="${esc(x.img)}" alt="" loading="lazy" style="aspect-ratio:${esc(x.ratio)}"><span class="play play-l">${PLAY}</span></a>
<p class="duo-l">${esc(x.label)}</p><h3>${esc(x.title)}</h3></article>`).join('\n')}
</div>` : ''}

${(d.council || d.promises.length || d.citywide.length) ? `<section aria-labelledby="council" class="sec">
<h2 id="council" class="h2">在議會</h2>
${d.council ? `<div class="big-row"><span class="big">${esc(d.council)}</span><span class="lead">件議員提案，然後兌現</span></div>` : ''}
${d.promises.length ? `<div class="promises">
${d.promises.map((x) => `<div class="pr"><div class="pr-a"><p class="k">提案 ${esc(x.asked)}</p><p>${esc(x.ask)}</p></div><div class="pa" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24"><path d="M4 12h14M13 6l6 6-6 6" fill="none" stroke="#141414" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="pr-b"><p class="k">兌現 ${esc(x.done)}</p><p>${esc(x.result)}</p></div></div>`).join('\n')}
</div>` : ''}
${d.citywide.length ? `<h3 class="h3">全${esc(p.city)}都受惠</h3>
<div class="cw">
${d.citywide.map((x) => `<div class="cwc"><p class="k">${esc(x.when)}</p><p class="t">${esc(x.title)}</p><p class="n">${esc(x.note)}</p></div>`).join('\n')}
</div>` : ''}
</section>` : ''}

${cand && d.doing.length ? `<section aria-labelledby="doing" class="sec">
<h2 id="doing" class="h2">已經在做的</h2>
<div class="pend">
${d.doing.map((x) => `<div class="pd"><div class="pt"><span class="chip">${esc(x.status)}</span>${esc(x.title)}</div><div class="pn">${esc(x.text)} <a href="${esc(x.url)}" target="_blank" rel="noopener">出處</a></div></div>`).join('\n')}
</div>
</section>` : ''}

${d.pending.length ? `<section aria-labelledby="pending" class="sec">
<h2 id="pending" class="h2">${esc(p.pron)}還在追的</h2>
<div class="pend">
${d.pending.map((x) => `<div class="pd"><div class="pt">${esc(x.title)}</div><div class="pn">${esc(x.note)}</div></div>`).join('\n')}
</div>
</section>` : ''}

</main>
<footer class="ft"><div class="wrap ft-in"><span>${SITE.name}・資料來源為${esc(p.name)}本人公開貼文、影片與議會紀錄</span><span>聯絡信箱：<a href="mailto:hi@teamtpp.com">hi@teamtpp.com</a></span></div></footer>
<script type="application/json" id="page-data">${JSON.stringify({ ...page, items: cand ? d.platform.map(({ who }) => ({ who })) : items.map(({ who, when, status, place, title, before, after, thumb }) => ({ who, when, status, place, title, before, after, thumb })) }).replace(/</g, '\\u003c')}</script>
<script src="/app.js" defer></script>
</body>
</html>
`;
}

// 看得見的改變: items + done promises + citywide, minus ones that repeat something already counted for that person.
// ponytail: CJK-bigram overlap heuristic; add an explicit "same" field in the data if it ever misjudges.
const bigrams = (s) => { const c = (s.match(/[\u4e00-\u9fff]/g) || []).join(''); const o = new Set(); for (let i = 0; i < c.length - 1; i++) o.add(c.slice(i, i + 2)); return o; };
function countChanges(people) {
  let n = 0;
  for (const d of people) {
    const seen = d.items.map((it) => bigrams(it.title + it.place + it.aShort + it.after));
    n += d.items.length;
    const extra = [...d.promises.filter((x) => x.done).map((x) => [x.ask, x.result]), ...d.citywide.map((x) => [x.title])];
    for (const texts of extra) {
      const dup = texts.some((t) => { const b = bigrams(t); return seen.some((s) => [...b].filter((x) => s.has(x)).length >= Math.max(2, b.size * 0.4)); });
      if (!dup) n++;
      seen.push(bigrams(texts.join('')));
    }
  }
  return n;
}

function indexPage(everyone) {
  const people = everyone.filter((d) => !d.kind);
  const cands = everyone.filter((d) => d.person.ballot && d.kind !== 'mayor-candidate'); // newcomers + incumbents running again
  const mayors = everyone.filter((d) => d.kind === 'mayor-candidate');
  const all = people.flatMap((d) => d.items.map((it, i) => ({ ...it, d, href: `/${d.slug}/#i-${i}` })));
  all.sort((a, b) => (sortKey(a) < sortKey(b) ? 1 : sortKey(a) > sortKey(b) ? -1 : 0));
  const total = countChanges(people);
  const council = people.reduce((n, d) => n + (parseInt(d.council, 10) || 0), 0);
  const updated = people.map((d) => d.person.updated).sort().pop();
  // carousel: newest first, but rotate through people so every councillor shows up
  const feed = all.slice(0, 8);
  // carousel = hand-picked 重大政績 (one per councillor, broad impact); never repeats an item shown in 最新完成
  const slides = MAJOR.map(([slug, i]) => all.find((x) => x.d.slug === slug && x.href.endsWith(`#i-${i}`))).filter((x) => x && !feed.includes(x));
  const nm = (d) => `${esc(d.person.name)}<span class="nm-o">${esc(d.person.office)}</span>`;
  return `${head({ title: `${SITE.name} teamtpp.com｜看得見的改變`, desc: `從路口、公園到治安、反毒、校園和孩子的鮮奶，民眾黨議員 ${total} 件看得見的改變，以及 11/28 參選人的政見。`, image: slides[0]?.thumb, url: SITE.url + '/' })}
<body class="idx">
<header class="hd"><div class="wrap hdr">
<span class="hdt brand"><img class="logo" src="/img/logo.png" alt="">${SITE.name}</span>
<span class="upd">最近更新 ${esc(updated)}</span>
</div></header>

<section class="ih"><div class="wrap ih-in">
<div class="ih-l">
<h1 class="ih-h">看得見的改變</h1>
<p class="ih-s">從路口、公園到治安、反毒、校園和孩子的鮮奶，民眾黨議員做成的每一件事，都是看得見的改變。</p>
<div class="stats">
<div class="stat"><span class="sn">${people.length}</span><span class="sl">位現任議員</span></div>
<div class="stat"><span class="sn">${total}</span><span class="sl">件看得見的改變</span></div>
<div class="stat"><span class="sn">${council}</span><span class="sl">件議員提案</span></div>
</div>
</div>
<div class="rot" aria-roledescription="carousel" aria-label="重大政績">
${slides.map((it, i) => `<a class="rs" href="${esc(it.href)}" data-n="${i}"${i ? ' hidden' : ''}>
<span class="rs-img" style="--bg:url('${esc(it.thumb)}')"><img src="${esc(it.thumb)}" alt="" ${i ? 'loading="lazy"' : ''}></span>
<span class="rs-body">
<span class="rs-who"><img src="${esc(it.d.portrait)}" alt=""><span>${nm(it.d)}</span></span>
<span class="rs-t">${esc(it.title)}</span>
<span class="rs-ba"><span class="rs-b"><b>以前</b>${esc(it.bShort)}</span><span class="rs-a"><b>現在</b>${esc(it.aShort)}</span></span>
<span class="rs-m">${esc(it.place)}・${esc(it.when)}</span>
</span>
</a>`).join('\n')}
<div class="rot-dots" role="tablist">${slides.map((_, i) => `<button type="button" class="rd" data-n="${i}" aria-label="第 ${i + 1} 則" aria-selected="${i === 0}"></button>`).join('')}</div>
</div>
</div></section>

<main class="wrap mn">
<section class="sec ix-feed">
<h2 class="h2">最新完成</h2>
<div class="feed">
${feed.map((it) => `<a class="fd" href="${esc(it.href)}"><span class="fd-img"><img src="${esc(it.thumb)}" alt="" loading="lazy"></span>
<span class="fd-m">${esc(it.when)}・${esc(it.d.person.name)}</span>
<span class="fd-t">${esc(it.title)}</span>
<span class="fd-a">${esc(it.aShort)}</span></a>`).join('\n')}
</div>
</section>
<h2 class="h2 ix-h">現任議員</h2>
<div class="people">
${people.map((d) => {
    const th = [...d.items].sort((a, b) => (sortKey(a) < sortKey(b) ? 1 : -1)).slice(0, 3);
    return `<a class="pc" href="/${d.slug}/">
<span class="pc-top"><img class="pc-img" src="${esc(d.portrait)}" alt="" loading="lazy"${d.portraitPos ? ` style="object-position:${esc(d.portraitPos)}"` : ''}></span>
<span class="pc-o">${esc(d.person.office)}</span>
<span class="pc-n">${esc(d.person.name)}</span>
<span class="pc-p">${esc(d.pitch[0])}</span>
<span class="pc-th">${th.map((x) => `<img src="${esc(x.thumb)}" alt="" loading="lazy">`).join('')}</span>
</a>`;
  }).join('\n')}
</div>

${mayors.length ? `<section class="sec">
<h2 class="h2">${esc(mayors[0].person.election)} 市長參選人</h2>
<div class="people">
${mayors.map((d) => `<a class="pc" href="/${d.slug}/">
<span class="pc-top"><img class="pc-img" src="${esc(d.portrait)}" alt="" loading="lazy">${ballotNo(d, 's')}</span>
<span class="pc-o">${esc(d.person.office.replace('參選人', ''))}</span>
<span class="pc-n">${esc(d.person.name)}</span>
<span class="pc-p">${esc(d.pitch[0])}</span>
</a>`).join('\n')}
</div>
</section>` : ''}
${cands.length ? `<section class="sec">
<h2 class="h2">${esc(cands[0].person.election)} 議員參選人</h2>
${CITIES.filter((c) => cands.some((d) => d.person.electCity === c)).map((c) => `<h3 class="h3 cty">${esc(c)}</h3>
<div class="people cmp">
${cands.filter((d) => d.person.electCity === c).sort((a, b) => (a.person.district - b.person.district) || (a.person.ballot - b.person.ballot)).map((d) => `<a class="pc" href="/${d.slug}/">
<span class="pc-top"><img class="pc-img" src="${esc(d.portrait)}" alt="" loading="lazy"${d.portraitPos ? ` style="object-position:${esc(d.portraitPos)}"` : ''}>${ballotNo(d, 's')}${d.kind === 'candidate' ? '' : '<span class="pc-tag">爭取連任</span>'}</span>
<span class="pc-n">${esc(d.person.name)}</span>
${distBox(d)}
<span class="pc-chips">${(d.platform?.length ? d.platform.map((x) => x.title) : d.pitch).slice(0, 3).map((t) => t).map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</span>
</a>`).join('\n')}
</div>`).join('\n')}
</section>` : ''}

</main>
<footer class="ft"><div class="wrap ft-in"><span>${SITE.name}・資料來源為議員本人公開貼文、影片與議會紀錄</span><span>聯絡信箱：<a href="mailto:hi@teamtpp.com">hi@teamtpp.com</a></span></div></footer>
<script src="/app.js" defer></script>
</body>
</html>
`;
}

// build
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });
const dir = path.join(ROOT, 'data', 'people');
const people = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
// landing order: most popular first, then north → central → south. Unlisted slugs go last.
const ORDER = ['huang-ching-ying', 'chen-shih-hsuan', 'lin-chen-yu', 'chen-yu-cheng', 'chang-chih-hao', 'sung-pin-ying', 'li-kuo-chang', 'lin-shuo-yen', 'chiang-ho-shu', 'chang-hsueh-ju', 'wu-wei-ta', 'chen-yi-chen'];
const rank = (d) => (ORDER.indexOf(d.slug) + 1) || 999;
people.sort((a, b) => rank(a) - rank(b));
for (const d of people) {
  fs.mkdirSync(path.join(DIST, d.slug), { recursive: true });
  fs.writeFileSync(path.join(DIST, d.slug, 'index.html'), personPage(d));
}
fs.writeFileSync(path.join(DIST, 'index.html'), indexPage(people));
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...people.map((d) => d.slug + '/')].map((u) => `<url><loc>${SITE.url}/${u}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE.url}/sitemap.xml\n`);
console.log(`built ${people.length} pages → dist/`);
