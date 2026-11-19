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

  /* Nova, same behaviour as in the app: spring gaze, head follows the eyes,
     real blinks with lids, idle glances, curious tilt, little hops, squish on click. */
  const nova = document.getElementById('nova');
  if (nova) {
    const space = document.getElementById('nova-space');
    const eyes = [...nova.querySelectorAll('.eye')], lids = [...nova.querySelectorAll('.nova-lid')];
    const face = nova.querySelector('.face'), mascot = nova.querySelector('.mascot');
    const SPRING = 'linear(0, .22 6%, .6 14%, .9 23%, 1.05 31%, 1.1 37%, 1.08 44%, 1.03 53%, .99 64%, .99 76%, 1)';
    const GENTLE = 'linear(0, .18 8%, .52 18%, .82 30%, .98 42%, 1.03 52%, 1.02 64%, 1)';
    let onScreen = true, frame = 0, target = { x: 0, y: 0, m: {} }, pointerUntil = 0, lastLook = -1, blinkN = 0, lookT, blinkT;
    const ok = () => onScreen && !document.hidden && !reduce;
    const play = (el, k, o) => el.animate ? el.animate(k, o) : null;
    const set = (k, v) => nova.style.setProperty(k, v);

    function gaze(x, y, m = {}) {
      target = { x, y, m };
      if (!ok() || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        let { x, y, m } = target;
        if (m.pointer) {
          const r = nova.getBoundingClientRect();
          x = Math.max(-16, Math.min(16, (x - r.left - r.width / 2) / 18));
          y = Math.max(-10, Math.min(10, (y - r.top - r.height / 2) / 22));
        }
        const d = m.duration ?? 760;
        set('--gaze-duration', `${d}ms`); set('--gaze-easing', m.easing ?? SPRING);
        set('--gaze-x', `${x}px`); set('--gaze-y', `${y}px`);
        set('--head-duration', `${Math.round(d * 1.45)}ms`); set('--head-easing', GENTLE);
        set('--head-x', `${(x * .55).toFixed(2)}px`); set('--head-y', `${(y * .7 - 2).toFixed(2)}px`);
        set('--head-turn', `${(x * .45).toFixed(2)}deg`); set('--eye-depth', `${1 + x * .005}`);
      });
    }
    function blink(double) {
      if (!ok()) return;
      const duration = blinkN++ % 3 === 2 ? 720 : 360;
      const run = () => {
        eyes.forEach(e => play(e, [
          { scale: '1 1', translate: '0 0', easing: 'cubic-bezier(.4,0,.7,1)' },
          { scale: '1 .4', translate: '0 18px', offset: .36 },
          { scale: '1 .4', translate: '0 18px', offset: .53, easing: 'cubic-bezier(.16,1,.3,1)' },
          { scale: '1 1', translate: '0 0' }], { duration }));
        lids.forEach(l => play(l, [
          { transform: 'translateY(-110%)', easing: 'cubic-bezier(.4,0,.7,1)' },
          { transform: 'translateY(-5%)', offset: .36 },
          { transform: 'translateY(-5%)', offset: .53, easing: 'cubic-bezier(.16,1,.3,1)' },
          { transform: 'translateY(-110%)' }], { duration }));
      };
      run(); if (double) setTimeout(run, duration + 120);
    }
    function scheduleBlink() {
      clearTimeout(blinkT);
      blinkT = setTimeout(() => { blink(Math.random() < .2); scheduleBlink(); }, 3200 + Math.random() * 3800);
    }
    const curious = () => play(face, [{ rotate: '0deg' }, { rotate: '-7deg', offset: .35 }, { rotate: '-7deg', offset: .7 }, { rotate: '0deg' }], { duration: 1500, easing: 'cubic-bezier(.45,0,.55,1)'});
    const hop = (h = 10) => play(mascot, [
      { translate: '0 0', scale: '1 1' }, { translate: '0 2px', scale: '1.05 .95', offset: .16 },
      { translate: `0 -${h}px`, scale: '.97 1.04', offset: .45 }, { translate: '0 1px', scale: '1.04 .96', offset: .78 },
      { translate: '0 0', scale: '1 1' }], { duration: 640, easing: 'cubic-bezier(.33,0,.25,1)' });
    const looks = [
      { x: -15, y: -4, d: 820, hold: 2250 }, { x: -10, y: 7, d: 700, hold: 1700, tilt: true },
      { x: 12, y: -10, d: 900, hold: 2380 }, { x: 16, y: 3, d: 760, hold: 1900, hop: true },
      { x: 5, y: 8, d: 640, hold: 1450 }, { x: 0, y: 0, d: 980, hold: 2600, tilt: true }];
    function scheduleLook(delay = 1500) {
      clearTimeout(lookT);
      lookT = setTimeout(() => {
        if (!ok()) return scheduleLook(1500);
        if (performance.now() < pointerUntil) return scheduleLook(pointerUntil - performance.now());
        let n; do { n = Math.floor(Math.random() * looks.length); } while (n === lastLook);
        lastLook = n; const l = looks[n];
        gaze(l.x, l.y, { duration: l.d });
        if (l.tilt) curious();
        if (l.hop && Math.random() < .6) hop(8);
        scheduleLook(l.hold);
      }, delay);
    }
    if (!reduce) {
      if (fine) addEventListener('pointermove', e => {
        pointerUntil = performance.now() + 3600;
        gaze(e.clientX, e.clientY, { duration: 520, pointer: true });
      }, { passive: true });
      nova.addEventListener('click', () => {
        play(mascot, [{ scale: '1 1' }, { scale: '1.09 .9', offset: .22 }, { scale: '.97 1.04', offset: .55 }, { scale: '1 1' }], { duration: 560, easing: 'cubic-bezier(.33,0,.25,1)' });
        space.classList.add('happy'); setTimeout(() => space.classList.remove('happy'), 900);
        setTimeout(() => { hop(14); blink(); }, 380);
      });
      new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(nova);
      /* Wakes up after the preloader: a hop and a look at the visitor. */
      setTimeout(() => { hop(10); gaze(0, 4, { duration: 600 }); }, 1300);
      scheduleBlink(); scheduleLook(2600);
    }
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
