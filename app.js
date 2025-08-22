/* ===== Helpers ===== */
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Year */
(() => { const y = $('#year'); if (y) y.textContent = new Date().getFullYear(); })();

/* Smooth anchors */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (!href || href === '#' || href === '#!') return;
  const id = decodeURIComponent(href.slice(1));
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  const header = document.querySelector('header');
  const offset = header ? header.getBoundingClientRect().height : 64;
  const y = target.getBoundingClientRect().top + window.scrollY - offset + 2;
  window.scrollTo({ top: y, behavior: prefersReduced ? 'auto' : 'smooth' });
}, { passive: true });

/* Mobile drawer */
(() => {
  const btn=$('#nav-toggle'), panel=$('#mobile-nav'), bd=$('#mnav-backdrop');
  if (!btn || !panel || !bd) return;
  let open=false;
  const onKey=(e)=>{ if(e.key==='Escape') hide(); };
  const show=()=>{ open=true; btn.setAttribute('aria-expanded','true'); panel.hidden=false; bd.hidden=false;
    requestAnimationFrame(()=>{ panel.classList.add('open'); bd.classList.add('show'); });
    document.addEventListener('keydown',onKey); };
  const hide=()=>{ open=false; btn.setAttribute('aria-expanded','false'); panel.classList.remove('open'); bd.classList.remove('show');
    const end=()=>{ panel.hidden=true; bd.hidden=true; panel.removeEventListener('transitionend', end); };
    prefersReduced?end():panel.addEventListener('transitionend', end);
    document.removeEventListener('keydown',onKey); };
  btn.addEventListener('click',()=>open?hide():show());
  bd.addEventListener('click', hide);
  panel.addEventListener('click',(e)=>{ if(e.target.closest('[data-close]')) hide(); });
})();

/* Spotlight cursor */
(() => {
  if (prefersReduced) return;
  addEventListener('pointermove', (e)=>{
    document.documentElement.style.setProperty('--spot-x', e.clientX+'px');
    document.documentElement.style.setProperty('--spot-y', e.clientY+'px');
  }, { passive: true });
})();

/* Starfield */
(() => {
  const c = $('#stars'); if (!c) return;
  const ctx = c.getContext('2d'); let w,h,dpr,stars=[];
  function resize(){
    dpr = Math.max(1, Math.min(window.devicePixelRatio||1,2));
    w = c.clientWidth || innerWidth; h = c.clientHeight || innerHeight;
    c.width = Math.floor(w*dpr); c.height = Math.floor(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    stars = Array.from({length: 180}, ()=>({ x:Math.random()*w, y:Math.random()*h, z:Math.random()*1.6+0.2, r:Math.random()*1.8+0.2 }));
  }
  resize(); addEventListener('resize', resize);
  (function tick(){
    ctx.clearRect(0,0,w,h);
    for(const s of stars){
      s.x += s.z*0.6; if(s.x>w) s.x=0;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${0.3 + s.z*0.55})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  })();
})();

/* Tilt + magnetic */
(() => {
  if (prefersReduced) return;
  $$('.mag').forEach(btn=>{
    let rAF; const onMove=e=>{ const r=btn.getBoundingClientRect(); const x=((e.clientX-r.left)/r.width-.5)*14; const y=((e.clientY-r.top)/r.height-.5)*14; btn.style.transform=`translate(${x}px,${y}px)`; };
    const reset=()=>{ btn.style.transform='translate(0,0)'; };
    btn.addEventListener('mousemove',(e)=>{ if(rAF) cancelAnimationFrame(rAF); rAF=requestAnimationFrame(()=>onMove(e)); });
    btn.addEventListener('mouseleave', reset);
  });
  const tilt=(card,e)=>{ const r=card.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height; const rx=(y-.5)*-6, ry=(x-.5)*6; card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`; };
  const leave=card=>{ card.style.transform='translateY(0)'; };
  $$('.tilt').forEach(card=>{ let rAF; card.addEventListener('mousemove',(e)=>{ if(rAF) cancelAnimationFrame(rAF); rAF=requestAnimationFrame(()=>tilt(card,e)); }); card.addEventListener('mouseleave',()=>leave(card)); });
})();

/* Reveal (repeat each time you scroll in/out) */
(() => {
  const els = $$('.reveal'); if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(el=>el.classList.add('show')); return; }
  const header = document.querySelector('header');
  const offset = header ? header.getBoundingClientRect().height : 64;
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if (en.isIntersecting) en.target.classList.add('show');
      else en.target.classList.remove('show'); // <-- remove when leaving so it re-animates next time
    });
  }, { rootMargin: `-${offset+10}px 0px -20% 0px`, threshold: 0.1 });
  els.forEach(el=>io.observe(el));
})();

/* Counters */
(() => {
  const counters = $$('.count'); if (!counters.length) return;
  const run = (el) => {
    const target = parseInt(el.dataset.target||'0',10);
    const start = performance.now(), dur = 1000;
    const step = (now) => {
      const p = Math.min(1,(now-start)/dur);
      el.textContent = Math.floor(p*target);
      if (p<1) requestAnimationFrame(step); else el.textContent=target;
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { counters.forEach(c=>run(c)); return; }
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if (en.isIntersecting) run(en.target);
    });
  }, { threshold: .6 });
  counters.forEach(c=>obs.observe(c));
})();

/* Typed taglines */
(() => {
  const el = $('#typed'); if (!el) return;
  let list=[]; try{ list = JSON.parse(el.dataset.taglines||'[]'); }catch{}
  if(!list.length) return;
  let i=0,j=0,del=false; const t=55, e=40, hold=900, wait=220;
  function tick(){
    const w=list[i]||''; el.textContent=w.slice(0,j);
    if(prefersReduced){ el.textContent=w; return; }
    if(!del){ if(j<w.length){ j++; setTimeout(tick,t); } else { setTimeout(()=>{ del=true; setTimeout(tick,e); }, hold); } }
    else { if(j>0){ j--; setTimeout(tick,e); } else { del=false; i=(i+1)%list.length; setTimeout(tick,wait); } }
  }
  tick();
})();

/* Custom Dropdown (reusable) */
(() => {
  const setup=(root)=>{
    const btn=$('.dd-btn',root), menu=$('.dd-menu',root), items=$$('.dd-item',root), hidden=$('input[type="hidden"]',root), label=$('.dd-label',root)||btn;
    if(!btn||!menu||!items.length) return;
    let open=false, idx=-1;
    const openMenu=()=>{ open=true; btn.setAttribute('aria-expanded','true'); menu.hidden=false; requestAnimationFrame(()=>menu.classList.add('open')); menu.focus(); };
    const closeMenu=()=>{ open=false; btn.setAttribute('aria-expanded','false'); menu.classList.remove('open'); const end=()=>{ menu.hidden=true; menu.removeEventListener('transitionend',end); }; menu.addEventListener('transitionend',end); btn.focus(); };
    const select=i=>{ const it=items[i]; if(!it) return; items.forEach(x=>x.classList.remove('active')); it.classList.add('active'); const v=it.dataset.value||it.textContent.trim(); if(hidden) hidden.value=v;
      if(label) {
        const txt = label.textContent?.toLowerCase().includes('category') ? 'Category'
                  : label.textContent?.toLowerCase().includes('sort') ? 'Sort'
                  : 'Project type';
        label.innerHTML = `${txt}: <span class="opacity-90">${it.textContent.trim()}</span>`;
      }
      closeMenu(); root.dispatchEvent(new CustomEvent('dropdown:change',{detail:{value:v}})); };
    btn.addEventListener('click',()=>open?closeMenu():openMenu());
    document.addEventListener('click',(e)=>{ if(!root.contains(e.target)) open&&closeMenu(); });
    items.forEach((it,i)=>{ it.setAttribute('tabindex','0'); it.addEventListener('click',()=>select(i)); it.addEventListener('keydown',(e)=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); select(i); } }); });
    menu.addEventListener('keydown',(e)=>{ if(e.key==='Escape') { e.preventDefault(); closeMenu(); } if(e.key==='ArrowDown'){ e.preventDefault(); idx=Math.min(items.length-1,idx+1); items[idx].focus(); } if(e.key==='ArrowUp'){ e.preventDefault(); idx=Math.max(0,idx-1); items[idx].focus(); } });
  };
  $$('.dd').forEach(setup);
})();

/* Projects: category + search + sort */
(() => {
  const grid=$('#proj-grid'); if(!grid) return;
  const cards=$$('.proj-card',grid);
  const search=$('#proj-search');
  const sortHidden = $('#proj-sort');
  const empty=$('#proj-empty');
  const countEl=$('#proj-count');
  const catHidden=$('#proj-cat');
  const catWrap=$('#projects .dd'); // first dd (category)
  const sortWrap=$('#proj-sort-dd');
  let currentCat = (catHidden?.value)||'All';

  const apply=()=>{
    const q=(search?.value||'').trim().toLowerCase();
    let visible=[];
    cards.forEach(card=>{
      const inCat = currentCat==='All'||card.dataset.cat===currentCat;
      const blob = (card.dataset.title+' '+card.dataset.desc+' '+card.dataset.tags).toLowerCase();
      const matchQ = !q || blob.includes(q);
      const show = inCat && matchQ;
      card.style.display = show ? '' : 'none';
      if(show) visible.push(card);
    });

    const mode = (sortHidden?.value) || 'new';
    const keyTitle = el=>(el.dataset.title||'').toLowerCase();
    const keyDate = el=>new Date(el.dataset.date||'1970-01-01').getTime();
    if(mode==='new') visible.sort((a,b)=>keyDate(b)-keyDate(a));
    else if(mode==='old') visible.sort((a,b)=>keyDate(a)-keyDate(b));
    else if(mode==='az') visible.sort((a,b)=>keyTitle(a).localeCompare(keyTitle(b)));
    else if(mode==='za') visible.sort((a,b)=>keyTitle(b).localeCompare(keyTitle(a)));
    visible.forEach(el=>grid.appendChild(el));

    empty.hidden = visible.length>0;
    if(countEl) countEl.textContent=String(visible.length);
  };

  search && search.addEventListener('input', apply);
  catWrap && catWrap.addEventListener('dropdown:change',(e)=>{ currentCat = e.detail.value || 'All'; if(catHidden) catHidden.value=currentCat; apply(); });
  sortWrap && sortWrap.addEventListener('dropdown:change',(e)=>{ const v = (e.detail && e.detail.value) ? String(e.detail.value) : 'new'; if (sortHidden) sortHidden.value = v; apply(); });
  apply();
})();

/* Meter fill on reveal */
(() => {
  const meters = $$('.meter'); if (!meters.length) return;
  const setVal = (el) => {
    const v = Number(el.getAttribute('data-value') || '0');
    el.querySelector('i').style.transform = `scaleX(${Math.max(0,Math.min(1,v/100))})`;
  };
  if (!('IntersectionObserver' in window)) { meters.forEach(setVal); return; }
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if (en.isIntersecting) setVal(en.target);
    });
  }, { threshold: .4 });
  meters.forEach(m=>obs.observe(m));
})();

/* Testimonials slider (responsive: 1 / 2 / 3 per view) */
(() => {
  const track = document.querySelector('#ts-track'); if (!track) return;
  const inner = track.querySelector('.ts-inner');
  const slides = Array.from(inner.querySelectorAll('.ts-slide'));
  const prev = document.querySelector('#ts-prev'), next = document.querySelector('#ts-next');
  const dotsWrap = document.querySelector('#ts-dots');

  let i = 0;               // current start index
  let perView = 1;         // 1, 2, 3 based on width
  let pages = 1;           // number of positions
  let auto;

  const getPerView = () => {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 768)  return 2;
    return 1;
  };

  const getGap = () => {
    const cs = getComputedStyle(inner);
    const g = parseFloat(cs.gap || '0');
    return isNaN(g) ? 0 : g;
  };

  const updateDots = () => {
    dotsWrap.innerHTML = '';
    for (let d = 0; d < pages; d++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.title = `Go to slide group ${d+1}`;
      if (d === i) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', () => { i = d; move(); });
      dotsWrap.appendChild(b);
    }
  };

  const move = () => {
    const maxStart = Math.max(0, slides.length - perView);
    i = Math.max(0, Math.min(i, maxStart));

    // step width = slide width + gap (no margins used)
    const slideWidth = slides[0].getBoundingClientRect().width;
    const step = slideWidth + getGap();
    inner.style.transform = `translateX(${-i * step}px)`;

    [...dotsWrap.children].forEach((b, idx) =>
      b.setAttribute('aria-current', String(idx === i))
    );
  };

  const recalc = () => {
    perView = getPerView();
    pages = Math.max(1, slides.length - perView + 1);
    if (i > pages - 1) i = pages - 1;
    updateDots();
    requestAnimationFrame(move);
  };

  prev?.addEventListener('click', () => { i -= 1; move(); });
  next?.addEventListener('click', () => { i += 1; move(); });

  const startAuto = () => { stopAuto(); auto = setInterval(() => { i += 1; move(); }, 4500); };
  const stopAuto  = () => { if (auto) clearInterval(auto); };
  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  addEventListener('resize', recalc, { passive: true });

  recalc();
  startAuto();
})();

/* Glowing divider: scroll-reactive color + spark */
(() => {
  const root = document.documentElement;
  const dividers = Array.from(document.querySelectorAll('.divider-glow'));
  if (!dividers.length) return;

  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? scrollY / max : 0;              // 0..1
    const hue = Math.round(p * 360);                    // spin colors
    const shift = (p * 200).toFixed(1) + '%';           // slide gradient
    root.style.setProperty('--divider-hue', hue + 'deg');
    root.style.setProperty('--divider-shift', shift);
    dividers.forEach(d => d.style.setProperty('--spark-x', (p * 100).toFixed(2) + '%'));
  };

  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(en => {
          const on = en.isIntersecting ? 1 : 0.85;
          en.target.style.setProperty('--divider-intensity', on);
        });
      }, { threshold: 0.1 })
    : null;

  dividers.forEach(d => io && io.observe(d));
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();

/* Neon main scrollbar: scroll-reactive color + gradient shift */
(() => {
  const root = document.documentElement;

  function update() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p   = max > 0 ? scrollY / max : 0;          // 0..1

    // WebKit: spin hues + slide gradient
    root.style.setProperty('--sb-hue',   (p * 360).toFixed(1) + 'deg');
    root.style.setProperty('--sb-shift', (p * 200).toFixed(1) + '%');

    // Firefox: update thumb color via variable
    const hue = (200 + p * 160) % 360;                // sweep 200→~360
    root.style.setProperty('--ff-thumb', `hsl(${hue} 85% 60% / 0.85)`);
  }

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();

/* Contact form → mailto redirect */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const TO_EMAIL = 'buddhikashahan2@gmail.com'; // ← replace with your address

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const name    = (fd.get('name') || '').toString().trim();
    const email   = (fd.get('email') || '').toString().trim();
    const company = (fd.get('company') || '').toString().trim();
    const type    = (fd.get('project_type') || '').toString().trim() || 'General Inquiry';
    const message = (fd.get('message') || '').toString().trim();

    const subject = `New inquiry: ${type} — ${name || 'Portfolio'}`;
    const body = [
      `Name: ${name || '-'}`,
      `Email: ${email || '-'}`,
      `Company: ${company || '-'}`,
      `Project type: ${type}`,
      `---`,
      message || ''
    ].join('\n');

    const href = `mailto:${encodeURIComponent(TO_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // open default mail client
    window.location.href = href;
  });
})();
