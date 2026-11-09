// AlertZero deck runtime: click-through builds inside one slide, plus small
// animation helpers. Load after style/eweb.js and before /js/fuckslides.js.
//
// Authoring: data-step="n" shows an element from the n-th click, data-off="n"
// hides it again from the n-th click, data-dim / data-hl toggle .dim / .hl.
// Slide scripts react with AZ.on((step, dir) => …); dir is 1, -1, or 0 for a jump.
// In the player the slide locks navigation until its last build, then hands
// the next click back. Going back into a slide lands on its final build.
(function(){
  const AZ = window.AZ = {};
  const inPlayer = window !== window.top;
  AZ.still = !!navigator.webdriver || /[?&]still\b/.test(location.search);   // PDF export or ?still: render the final frame
  let step = 0, max = 0, ready = false;
  const hooks = [];
  AZ.step = () => step;
  AZ.on = fn => { hooks.push(fn); if (ready) fn(step, 0); };

  // ── number counters ──────────────────────────────────────────────────────
  function fmt(v, e){
    const dec = +(e.dataset.dec || 0);
    const s = e.dataset.sep !== undefined ? v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec}) : v.toFixed(dec);
    return (e.dataset.pre || '') + s + (e.dataset.post || '');
  }
  AZ.count = function(e, to, o){
    o = Object.assign({from: 0, dur: 1.2, delay: .12}, o || {});
    const id = (e._cid = (e._cid || 0) + 1), t0 = performance.now();
    if (AZ.still){ e.textContent = fmt(to, e); return; }
    const f = now => {
      if (e._cid !== id) return;
      const k = EW.ease(((now - t0) / 1000 - o.delay) / o.dur);
      e.textContent = fmt(o.from + (to - o.from) * k, e);
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };
  function countIn(root){
    const list = [root, ...root.querySelectorAll('[data-n]')].filter(x => x.dataset && x.dataset.n !== undefined);
    list.forEach(x => AZ.count(x, +x.dataset.n, {from: +(x.dataset.from || 0), dur: +(x.dataset.dur || 1.2), delay: +(x.dataset.delay || .12)}));
  }

  // ── builds ───────────────────────────────────────────────────────────────
  function render(dir){
    document.querySelectorAll('[data-step],[data-off]').forEach(e => {
      const s = +(e.dataset.step || 0), off = e.dataset.off !== undefined ? +e.dataset.off : Infinity;
      const on = step >= s && step < off;
      if (on && !e.classList.contains('on') && e.dataset.step !== undefined) countIn(e);
      e.classList.toggle('on', on);
    });
    document.querySelectorAll('[data-hl]').forEach(e => e.classList.toggle('hl', step >= +e.dataset.hl && (e.dataset.hlOff === undefined || step < +e.dataset.hlOff)));
    document.querySelectorAll('[data-dim]').forEach(e => e.classList.toggle('dim', step >= +e.dataset.dim));
    document.body.dataset.at = step;
    pips();
    hooks.forEach(fn => fn(step, dir));
  }
  function pips(){
    if (!max) return;
    let p = document.querySelector('.az-pips');
    if (!p){ p = document.createElement('div'); p.className = 'az-pips'; for (let i = 0; i <= max; i++) p.appendChild(document.createElement('i')); document.body.appendChild(p); }
    [...p.children].forEach((c, i) => c.classList.toggle('on', i <= step));
  }
  const NEXT = ['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'], PREV = ['ArrowLeft', 'ArrowUp', 'PageUp'];
  // true: handled inside the slide; false: at the edge, the deck should move; null: not a nav key
  function key(k){
    if (NEXT.includes(k)){ if (step < max){ step++; render(1); return true; } return false; }
    if (PREV.includes(k)){ if (step > 0){ step--; render(-1); return true; } try { sessionStorage.setItem('az-back', '1'); } catch (_) {} return false; }
    return null;
  }
  AZ.go = n => { step = Math.max(0, Math.min(max, n)); render(0); };

  if (inPlayer){
    window.addEventListener('message', e => {
      if (!e.data || e.data.type !== 'player-keydown') return;
      const r = key(e.data.key);
      if (r === false) parent.postMessage({type: NEXT.includes(e.data.key) ? 'nav-next' : 'nav-prev'}, '*');
      else if (r === null){
        // Not ours (F, W …): let the player handle it, then take navigation back.
        parent.postMessage({type: 'nav-unlock'}, '*');
        parent.postMessage({type: 'keydown', key: e.data.key}, '*');
        parent.postMessage({type: 'nav-lock'}, '*');
      }
    });
  } else {
    window.addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (key(e.key) === true){ e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const nums = s => [...document.querySelectorAll(s)].map(e => +(e.dataset.step || e.dataset.off || 0));
    max = Math.max(0, ...nums('[data-step]'), ...nums('[data-off]'), +(document.body.dataset.steps || 0));
    let back = false;
    try { back = sessionStorage.getItem('az-back') === '1'; sessionStorage.removeItem('az-back'); } catch (_) {}
    if (AZ.still){ document.body.classList.add('az-still'); step = max; }
    else if (back) step = max;
    ready = true;
    // counters outside any build run on load
    document.querySelectorAll('[data-n]').forEach(x => { if (!x.closest('[data-step]')) AZ.count(x, +x.dataset.n, {from: +(x.dataset.from || 0), dur: +(x.dataset.dur || 1.2), delay: +(x.dataset.delay || .35)}); });
    render(0);
    if (inPlayer && max > 0) parent.postMessage({type: 'nav-lock'}, '*');
  });

  // ── helpers ──────────────────────────────────────────────────────────────
  // Iso scene that knows its own clock, so builds can drop solids in on a click.
  AZ.iso = (svg, o) => { const sc = EW.iso(svg, o), t0 = performance.now(); sc.now = () => (performance.now() - t0) / 1000; return sc; };
  // Show (on) or hide iso items; items created with delay: 1e9 wait for this.
  AZ.reveal = (sc, items, on, o) => {
    o = Object.assign({at: 0, gap: .08}, o || {});
    [].concat(items).forEach((it, i) => {
      if (!on) it.delay = 1e9;
      else if (it.delay > 1e8) it.delay = AZ.still ? -5 : sc.now() + o.at + i * o.gap;
    });
  };
  // Dots that travel along an SVG path while ctl.on is true.
  AZ.flow = function(path, o){
    o = Object.assign({n: 3, dur: 2.4, r: 3.2, fill: '#0B64DD', on: true, parent: path.parentNode, shape: 'circle'}, o || {});
    const L = path.getTotalLength(), ctl = {on: o.on};
    const dots = Array.from({length: o.n}, () => o.shape === 'rect'
      ? EW.el('rect', {width: o.r * 2, height: o.r * 2, fill: o.fill, opacity: 0}, o.parent)
      : EW.el('circle', {r: o.r, fill: o.fill, opacity: 0}, o.parent));
    let a = 0;
    EW.loop(t => {
      a += ((ctl.on ? 1 : 0) - a) * .08;
      dots.forEach((d, i) => {
        const k = ((t / o.dur) + i / o.n) % 1, p = path.getPointAtLength(k * L);
        if (o.shape === 'rect'){ d.setAttribute('x', p.x - o.r); d.setAttribute('y', p.y - o.r); }
        else { d.setAttribute('cx', p.x); d.setAttribute('cy', p.y); }
        d.setAttribute('opacity', (a * Math.min(1, Math.min(k, 1 - k) * 10)).toFixed(3));
      });
    });
    return ctl;
  };
  // Type text into an element, one character at a time.
  AZ.type = function(e, text, o){
    o = Object.assign({cps: 38, delay: 0}, o || {});
    const id = (e._tid = (e._tid || 0) + 1);
    if (AZ.still){ e.textContent = text; return; }
    e.textContent = '';
    const t0 = performance.now() + o.delay * 1000;
    const f = now => { if (e._tid !== id) return; const n = Math.max(0, Math.floor((now - t0) / 1000 * o.cps)); e.textContent = text.slice(0, n); if (n < text.length) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  AZ.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
})();
