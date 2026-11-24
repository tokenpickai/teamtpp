(() => {
  const slides = [...document.querySelectorAll('.rs')];
  if (!slides.length) return;
  const dots = [...document.querySelectorAll('.rd')];
  let k = 0, stopped = false;
  const go = (n) => {
    slides[k].hidden = true; dots[k].setAttribute('aria-selected', 'false');
    k = (n + slides.length) % slides.length;
    slides[k].hidden = false; slides[k].classList.remove('in'); void slides[k].offsetWidth; slides[k].classList.add('in');
    dots[k].setAttribute('aria-selected', 'true');
  };
  dots.forEach((d, i) => d.addEventListener('click', () => { stopped = true; go(i); }));
  const rot = document.querySelector('.rot');
  let hover = false;
  rot.addEventListener('mouseenter', () => { hover = true; });
  rot.addEventListener('mouseleave', () => { hover = false; });
  setInterval(() => { if (!stopped && !hover && !document.hidden) go(k + 1); }, 6000);
})();

(() => {
  const dataEl = document.getElementById('page-data');
  if (!dataEl) return;
  const D = JSON.parse(dataEl.textContent);
  const btns = [...document.querySelectorAll('.pp')];
  const arts = [...document.querySelectorAll('.ar')];
  const fan = [...document.querySelectorAll('.fan .f')];
  const cnt = document.getElementById('cnt');
  const lead = document.getElementById('lead');
  let cur = D.personas[0].id;
  let auto = true;

  function show(id) {
    cur = id;
    const p = D.personas.find((x) => x.id === id);
    btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    const on = [];
    arts.forEach((a) => {
      const hit = a.dataset.who.split(' ').includes(id);
      a.hidden = !hit;
      if (hit) on.push(D.items[+a.dataset.i]);
    });
    cnt.textContent = on.length;
    lead.textContent = p.lead;
    fan.forEach((img, i) => {
      if (on[i]) { img.src = on[i].thumb; img.hidden = false; } else img.hidden = true;
    });
  }

  btns.forEach((b) => b.addEventListener('click', () => { auto = false; show(b.dataset.id); }));
  // deep link from 最近完成: switch to a persona that shows the item, then scroll + flash it
  function reveal() {
    const el = location.hash && document.getElementById(location.hash.slice(1));
    if (!el || !el.classList.contains('ar')) return;
    auto = false;
    if (el.hidden) show(el.dataset.who.split(' ')[0]);
    el.scrollIntoView({ block: 'start' });
    el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit');
  }
  reveal();
  window.addEventListener('hashchange', reveal);
  const stop = () => { auto = false; };
  ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach((t) => window.addEventListener(t, stop, { passive: true }));
  document.addEventListener('scroll', stop, { passive: true, capture: true });
  setInterval(() => {
    if (!auto || document.hidden) return;
    const ids = D.personas.map((x) => x.id);
    show(ids[(ids.indexOf(cur) + 1) % ids.length]);
  }, 7000);

  // share card
  function wrap(ctx, text, maxW) {
    const lines = [];
    let line = '';
    for (const ch of Array.from(text)) {
      if (ctx.measureText(line + ch).width > maxW && line) { lines.push(line); line = ch; } else line += ch;
    }
    if (line) lines.push(line);
    return lines;
  }

  async function card(d) {
    await document.fonts.load("900 72px 'Noto Serif TC'", d.title + D.office + D.name + '民眾隊');
    await document.fonts.load("700 40px 'Noto Sans TC'", d.after + d.before + d.place + d.status + d.when + '以前現在');
    const img = new Image();
    img.src = d.thumb;
    await img.decode();
    const W = 1080, c = document.createElement('canvas');
    c.width = W; c.height = 2600;
    const x = c.getContext('2d');
    x.fillStyle = '#F4F1EA'; x.fillRect(0, 0, W, c.height);
    // who: top line
    x.fillStyle = '#28C8C8'; x.beginPath(); x.arc(92, 96, 12, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#141414'; x.font = "900 44px 'Noto Serif TC'"; x.textBaseline = 'middle';
    x.fillText(D.office + ' ' + D.name, 124, 98);
    x.textBaseline = 'alphabetic';
    // photo + place/title
    const tw = 405, tx = 80, ty = 170, th = Math.min(600, Math.round(tw * img.naturalHeight / img.naturalWidth));
    x.save(); x.beginPath(); x.roundRect(tx, ty, tw, th, 32); x.clip(); x.drawImage(img, tx, ty, tw, th); x.restore();
    x.fillStyle = '#3E5A5C'; x.font = "700 34px 'Noto Sans TC'";
    let yy = ty + 34;
    wrap(x, d.place, 455).forEach((l) => { x.fillText(l, 545, yy); yy += 48; });
    x.fillStyle = '#141414'; x.font = "900 64px 'Noto Serif TC'";
    yy += 40;
    wrap(x, d.title, 455).forEach((l) => { x.fillText(l, 545, yy); yy += 84; });
    let y = Math.max(ty + th, yy - 40) + 80;
    // 以前
    x.fillStyle = '#E2DED5';
    x.font = "500 40px 'Noto Sans TC'";
    const beforeLines = wrap(x, d.before, 860);
    const bH = 100 + beforeLines.length * 60;
    x.beginPath(); x.roundRect(80, y, 920, bH, 28); x.fill();
    x.fillStyle = '#5A5A5A'; x.font = "900 32px 'Noto Sans TC'"; x.fillText('以前', 110, y + 62);
    x.fillStyle = '#4A4A4A'; x.font = "500 40px 'Noto Sans TC'";
    let by = y + 122; beforeLines.forEach((l) => { x.fillText(l, 110, by); by += 60; });
    y += bH + 30;
    // down arrow + when/status (mirrors the page's arrow)
    x.strokeStyle = '#141414'; x.lineWidth = 7; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(140, y); x.lineTo(140, y + 90); x.moveTo(112, y + 62); x.lineTo(140, y + 92); x.lineTo(168, y + 62); x.stroke();
    x.fillStyle = '#141414'; x.font = "900 44px 'Noto Serif TC'"; x.textBaseline = 'middle';
    x.fillText(d.when, 200, y + 46);
    const ww = x.measureText(d.when).width;
    if (d.status && d.status.length <= 10) { x.fillStyle = '#0A6E70'; x.font = "700 34px 'Noto Sans TC'"; x.fillText(d.status, 200 + ww + 28, y + 48); }
    x.textBaseline = 'alphabetic';
    y += 130;
    // 現在
    x.font = "700 40px 'Noto Sans TC'";
    const nowLines = wrap(x, d.after, 860);
    const nH = 100 + nowLines.length * 60;
    x.fillStyle = '#28C8C8'; x.beginPath(); x.roundRect(80, y, 920, nH, 28); x.fill();
    x.fillStyle = '#0B2F33'; x.font = "900 32px 'Noto Sans TC'"; x.fillText('現在', 110, y + 62);
    x.fillStyle = '#10282B'; x.font = "700 40px 'Noto Sans TC'";
    let ny = y + 122; nowLines.forEach((l) => { x.fillText(l, 110, ny); ny += 60; });
    y += nH + 70;
    // footer
    x.fillStyle = '#141414'; x.fillRect(80, y, 920, 3);
    y += 80;
    x.font = "900 40px 'Noto Serif TC'"; x.fillText('民眾隊', 80, y);
    const bw = x.measureText('民眾隊').width;
    x.fillStyle = '#28C8C8'; x.beginPath(); x.arc(80 + bw + 26, y - 14, 8, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#141414'; x.font = "700 36px 'Noto Sans TC'"; x.fillText('teamtpp.com', 80 + bw + 52, y);
    y += 70;
    const out = document.createElement('canvas'); out.width = W; out.height = y;
    out.getContext('2d').drawImage(c, 0, 0);
    return new Promise((r) => out.toBlob(r, 'image/png'));
  }

  document.querySelectorAll('.sb').forEach((b) => b.addEventListener('click', async () => {
    auto = false;
    const d = D.items[+b.dataset.i];
    b.disabled = true;
    b.textContent = '製作中…';
    try {
      const blob = await card(d);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = D.name + '-' + d.title + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      b.textContent = '已下載';
    } catch (e) {
      b.textContent = '下載分享圖卡';
    }
    b.disabled = false;
  }));
})();
