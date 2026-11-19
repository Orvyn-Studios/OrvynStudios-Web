/* Orvyn Studios — base interactions. No dependencies. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  /* Headline: stagger each word. */
  document.querySelectorAll('.display .word').forEach((w, i) => w.style.setProperty('--i', i));

  /* Nav background after scrolling. */
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Scroll reveal. */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* Aurora background: a few soft colour blobs drifting on a canvas. */
  const canvas = document.getElementById('aurora');
  const ctx = canvas.getContext('2d');
  const blobs = [
    { h: 248, s: .55, r: .55, x: .2, y: .2, sx: .00011, sy: .00007 },
    { h: 222, s: .45, r: .5, x: .8, y: .3, sx: .00008, sy: .00012 },
    { h: 276, s: .35, r: .45, x: .5, y: .9, sx: .0001, sy: .00009 }
  ];
  let w = 0, h = 0, dpr = 1, raf = 0;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    // Rendered at a quarter of the resolution: blobs are blurry anyway, and it stays cheap.
    w = canvas.width = Math.ceil(innerWidth * dpr / 4);
    h = canvas.height = Math.ceil(innerHeight * dpr / 4);
  }
  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of blobs) {
      const x = (b.x + Math.sin(t * b.sx) * .18) * w;
      const y = (b.y + Math.cos(t * b.sy) * .14) * h - scrollY * .05 / 4;
      const r = b.r * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${b.h}, 90%, 62%, ${b.s * .35})`);
      g.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    if (!reduce) raf = requestAnimationFrame(draw);
  }
  size(); addEventListener('resize', size);
  raf = requestAnimationFrame(draw);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(draw);
  });

  /* Nova: eyes follow the pointer, body tilts slightly. */
  const nova = document.getElementById('nova');
  if (nova && fine && !reduce) {
    const eyes = nova.querySelector('.nova-eyes');
    const body = nova.querySelector('.nova-body');
    let pending = false, px = 0, py = 0;
    addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY;
      if (pending) return; pending = true;
      requestAnimationFrame(() => {
        pending = false;
        const r = nova.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / (innerWidth / 2)));
        const dy = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / (innerHeight / 2)));
        eyes.style.setProperty('--ex', `${dx * 9}%`);
        eyes.style.setProperty('--ey', `${dy * 8}%`);
        body.style.transform = `rotateY(${dx * 12}deg) rotateX(${-dy * 10}deg)`;
      });
    }, { passive: true });
  }

  /* 3D tilt on product visuals. */
  if (fine && !reduce) document.querySelectorAll('[data-tilt]').forEach(el => {
    const win = el.querySelector('.window');
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      win.style.setProperty('--ry', `${x * 10}deg`); win.style.setProperty('--rx', `${-y * 8}deg`);
    });
    el.addEventListener('pointerleave', () => { win.style.setProperty('--ry', '0deg'); win.style.setProperty('--rx', '0deg'); });
  });

  /* Card spotlight follows the pointer. */
  document.querySelectorAll('.card').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));

  /* Nivo island demo: cycle through states while visible. */
  const island = document.getElementById('island');
  if (island) {
    const states = ['idle', 'music', 'idle', 'timer', 'idle', 'notify'];
    let i = 0, timer = 0, visible = false;
    const tick = () => { i = (i + 1) % states.length; island.dataset.state = states[i]; timer = setTimeout(tick, states[i] === 'idle' ? 900 : 2600); };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting; clearTimeout(timer);
      if (visible && !reduce) timer = setTimeout(tick, 600);
      else if (reduce) island.dataset.state = 'music';
    }).observe(island);
  }
  /* StarOptimizer showcase: the step in the middle of the screen picks the screenshot. */
  const showcase = document.getElementById('showcase');
  if (showcase) {
    const steps = showcase.querySelectorAll('.showcase-steps li');
    const shots = showcase.querySelectorAll('.showcase-screens img');
    const dots = showcase.querySelectorAll('.showcase-dots i');
    const setStep = n => [steps, shots, dots].forEach(list =>
      list.forEach((el, i) => el.classList.toggle('active', i === n)));
    const sio = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) setStep(+e.target.dataset.step);
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => sio.observe(s));
  }

  /* ---------- v2 motion layer ---------- */
  const root = document.documentElement;

  /* Preloader: once per session, never longer than ~1 s. */
  const pre = document.getElementById('preloader');
  let seen = false;
  try { seen = sessionStorage.getItem('orvyn-pl') === '1'; sessionStorage.setItem('orvyn-pl', '1'); } catch (_) {}
  const start = () => root.classList.add('loaded');
  if (!pre || seen || reduce) { root.classList.add('no-preload'); start(); }
  else {
    let lifted = false;
    const lift = () => { if (lifted) return; lifted = true; pre.classList.add('done'); setTimeout(start, 250); };
    const t0 = performance.now();
    const go = () => setTimeout(lift, Math.max(0, 750 - (performance.now() - t0)));
    if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
    setTimeout(lift, 1000);
  }

  /* Scroll progress + hero parallax, one rAF per frame. */
  const bar = document.getElementById('progress');
  let ticking = false;
  const onFrame = () => {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    bar.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    if (!reduce && scrollY < innerHeight * 1.2) root.style.setProperty('--sy', scrollY.toFixed(0));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
  onFrame();

  /* Split section titles into masked words that rise in. */
  document.querySelectorAll('.title').forEach(t => {
    let i = 0;
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const inner = document.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
          w.append(inner); frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(t);
    t.classList.add('split', 'reveal');
    io.observe(t);
  });

  if (fine && !reduce) {
    /* Custom cursor: dot follows exactly, ring eases behind. */
    const cur = document.getElementById('cursor');
    const dot = cur.querySelector('.cursor-dot'), ring = cur.querySelector('.cursor-ring');
    root.classList.add('has-cursor');
    let mx = -100, my = -100, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px, ${my}px)`; }, { passive: true });
    addEventListener('pointerdown', () => cur.classList.add('down'));
    addEventListener('pointerup', () => cur.classList.remove('down'));
    document.addEventListener('pointerover', e => cur.classList.toggle('hover', !!e.target.closest('a, button, [data-tilt]')));
    document.documentElement.addEventListener('mouseleave', () => { cur.style.opacity = 0; });
    document.documentElement.addEventListener('mouseenter', () => { cur.style.opacity = 1; });
    (function follow() {
      rx += (mx - rx) * .18; ry += (my - ry) * .18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    })();

    /* Magnetic buttons. */
    document.querySelectorAll('[data-magnetic]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });

    /* Final CTA glow follows the pointer. */
    const cta = document.querySelector('.cta-final');
    if (cta) cta.addEventListener('pointermove', e => {
      const r = cta.getBoundingClientRect();
      cta.style.setProperty('--gx', `${e.clientX - r.left}px`); cta.style.setProperty('--gy', `${e.clientY - r.top}px`);
    });
  }
})();
