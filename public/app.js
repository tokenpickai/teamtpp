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
    await document.fonts.load("900 72px 'Noto Serif TC'", d.title + D.office + D.name + 'teamtpp');
    await document.fonts.load("700 40px 'Noto Sans TC'", d.after + d.before + d.place + d.status + d.when + '以前現在');
    const img = new Image();
    img.src = d.thumb;
    await img.decode();
    const W = 1080, H = 1920, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');
    x.fillStyle = '#F4F1EA'; x.fillRect(0, 0, W, H);
    const tw = 405, tx = 80, ty = 120, th = Math.min(720, Math.round(tw * img.naturalHeight / img.naturalWidth));
    x.save(); x.beginPath(); x.roundRect(tx, ty, tw, th, 32); x.clip(); x.drawImage(img, tx, ty, tw, th); x.restore();
    x.fillStyle = '#28C8C8'; x.beginPath(); x.roundRect(545, ty, 455, 84, 42); x.fill();
    x.fillStyle = '#141414'; x.font = "900 36px 'Noto Sans TC'"; x.textBaseline = 'middle';
    x.fillText(d.status.length > 10 ? d.when : d.status + '・' + d.when, 575, ty + 43);
    x.textBaseline = 'alphabetic';
    x.fillStyle = '#3E5A5C'; x.font = "700 34px 'Noto Sans TC'";
    let yy = ty + 170;
    wrap(x, d.place, 455).forEach((l) => { x.fillText(l, 545, yy); yy += 48; });
    x.fillStyle = '#141414'; x.font = "900 64px 'Noto Serif TC'";
    yy += 30;
    wrap(x, d.title, 455).forEach((l) => { x.fillText(l, 545, yy); yy += 84; });
    let y = Math.max(ty + th + 110, yy + 40);
    x.fillStyle = '#5F7577'; x.font = "900 32px 'Noto Sans TC'"; x.fillText('以前', 80, y); y += 58;
    x.fillStyle = '#4A6163'; x.font = "500 40px 'Noto Sans TC'";
    wrap(x, d.before, 920).forEach((l) => { x.fillText(l, 80, y); y += 60; });
    y += 40;
    x.font = "700 40px 'Noto Sans TC'";
    const nowLines = wrap(x, d.after, 860);
    const boxH = 100 + nowLines.length * 60;
    x.fillStyle = '#FFFFFF'; x.fillRect(80, y, 920, boxH);
    x.fillStyle = '#28C8C8'; x.fillRect(80, y, 920, 12);
    x.fillStyle = '#0A6E70'; x.font = "900 32px 'Noto Sans TC'"; x.fillText('現在', 110, y + 70);
    x.fillStyle = '#141414'; x.font = "700 40px 'Noto Sans TC'";
    let ny = y + 130;
    nowLines.forEach((l) => { x.fillText(l, 110, ny); ny += 60; });
    x.fillStyle = '#141414'; x.fillRect(80, H - 170, 920, 3);
    x.font = "900 44px 'Noto Serif TC'"; x.fillText('teamtpp', 80, H - 90);
    const bw = x.measureText('teamtpp').width;
    x.fillStyle = '#28C8C8'; x.beginPath(); x.arc(80 + bw + 28, H - 105, 9, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#141414'; x.font = "900 40px 'Noto Serif TC'"; x.fillText(D.office + D.name, 80 + bw + 56, H - 90);
    return new Promise((r) => c.toBlob(r, 'image/png'));
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
