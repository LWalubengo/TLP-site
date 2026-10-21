// Nav scroll state
const navEl = document.getElementById('siteNav');
window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// Process thread signature animation
const stages = document.querySelectorAll('.process-stage');
const threadFill = document.getElementById('threadFill');
const stageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const n = Number(entry.target.getAttribute('data-stage'));
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      let maxActive = 0;
      stages.forEach(s => { if (s.classList.contains('active')) maxActive = Math.max(maxActive, Number(s.getAttribute('data-stage'))); });
      threadFill.style.height = ((maxActive - 0.5) / stages.length * 100) + '%';
    }
  });
}, { threshold: 0.55 });
stages.forEach(s => stageObserver.observe(s));

// FAQ accordion
document.querySelectorAll('.faq-item').forEach(item => {
  const btn = item.querySelector('.faq-q');
  const answer = item.querySelector('.faq-a');
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

// Contact form — sends to FormSubmit's fast (AJAX) endpoint, which emails mukitedigital@gmail.com
const form = document.getElementById('legacyForm');
const formFields = document.getElementById('formFields');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');
const submitBtn = document.getElementById('formSubmit');
const submitLabel = submitBtn.querySelector('.btn-label');

// One request per browser per day. This stops repeat and accidental double submissions;
// someone determined could still use a different browser or device.
const SENT_KEY = 'tlp_enquiry_sent';
const LIMIT_MS = 24 * 60 * 60 * 1000;
function lastSent() { try { return Number(localStorage.getItem(SENT_KEY)) || 0; } catch (e) { return 0; } }
function markSent() { try { localStorage.setItem(SENT_KEY, String(Date.now())); } catch (e) {} }
function showReceived(already) {
  formFields.style.display = 'none';
  if (already) {
    document.getElementById('successTitle').textContent = 'We already have your request.';
    document.getElementById('successText').textContent = 'Thank you. We’ll be in touch shortly. If you’d like to add anything, call 0722 782 444.';
  }
  formSuccess.classList.add('show');
}
if (Date.now() - lastSent() < LIMIT_MS) showReceived(true);

const MESSAGES = {
  fname: { valueMissing: 'Please enter your name.', tooShort: 'Please enter your full name.' },
  femail: { valueMissing: 'Please enter your email address.', typeMismatch: 'That email address doesn’t look right. Please check it.' },
  fphone: { valueMissing: 'Please enter a phone number.', patternMismatch: 'Please enter a phone number with at least 9 digits.' },
  frelation: { valueMissing: 'Please choose who this story belongs to.' },
  fmessage: { valueMissing: 'Please tell us a little about the story.', tooShort: 'Please add a little more detail.' }
};
function checkField(el) {
  const msgEl = document.getElementById(el.id + '-msg');
  if (!msgEl) return true;
  el.value = el.tagName === 'SELECT' ? el.value : el.value.replace(/^\s+/, '');
  let msg = '';
  if (el.id === 'fphone' && el.value) {
    const digits = el.value.replace(/\D/g, '').length;
    if (!/^\+?[0-9\s()\-]+$/.test(el.value.trim()) || digits < 9 || digits > 15) msg = MESSAGES.fphone.patternMismatch;
  }
  if (!msg && !el.validity.valid) {
    const m = MESSAGES[el.id] || {};
    for (const k of ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooShort']) if (el.validity[k]) { msg = m[k] || 'Please check this field.'; break; }
  }
  msgEl.textContent = msg;
  el.classList.toggle('invalid', !!msg);
  el.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}
const fieldEls = Object.keys(MESSAGES).map(id => document.getElementById(id));
fieldEls.forEach(el => {
  el.setAttribute('aria-describedby', el.id + '-msg');
  el.addEventListener('blur', () => { if (el.value || el.classList.contains('invalid')) checkField(el); });
  el.addEventListener('input', () => { if (el.classList.contains('invalid')) checkField(el); });
  el.addEventListener('change', () => { if (el.classList.contains('invalid')) checkField(el); });
});

let sending = false;
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (sending) return;
  formError.classList.remove('show');
  const bad = fieldEls.filter(el => !checkField(el));
  if (bad.length) { bad[0].focus(); return; }
  if (Date.now() - lastSent() < LIMIT_MS) { showReceived(true); return; }

  sending = true;
  submitBtn.disabled = true;
  submitBtn.classList.add('is-sending');
  submitLabel.textContent = 'Sending your request…';
  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' },
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && String(data.success) !== 'false') {
      markSent();
      showReceived(false);
    } else {
      throw new Error('Submission failed');
    }
  } catch (err) {
    formError.classList.add('show');
    submitBtn.disabled = false;
    submitBtn.classList.remove('is-sending');
    submitLabel.textContent = 'Request a Discovery Call';
  } finally {
    sending = false;
  }
});

// ---------- What you receive: tabs ----------
const showTabs = Array.from(document.querySelectorAll('.show-tab'));
function selectShowTab(tab, focus) {
  showTabs.forEach(t => {
    const on = t === tab;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls'));
    if (panel) { panel.hidden = !on; panel.classList.toggle('active', on); }
  });
  if (focus) tab.focus();
}
showTabs.forEach((t, i) => {
  t.tabIndex = i === 0 ? 0 : -1;
  t.addEventListener('click', () => selectShowTab(t));
  t.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + showTabs.length) % showTabs.length;
      selectShowTab(showTabs[n], true);
    }
  });
});

// ---------- Build your legacy explorer ----------
const PACKAGES = {
  conversation: { name: 'Legacy Conversation', items: [
    ['mic', 'One 2-hour interview'], ['film', 'A story film'], ['phone', 'Two short cuts to share'],
    ['pen', 'A 1,500–2,000 word written profile'], ['archive', 'Digital archive'] ] },
  portrait: { name: 'Legacy Portrait', items: [
    ['mic', 'Four 90-minute interviews'], ['film', 'A legacy film'], ['phone', 'Two short films'],
    ['camera', 'A professional photography session'], ['book', 'A 5,000–7,000 word legacy book'], ['archive', 'Digital archive'] ] },
  archive: { name: 'Legacy Archive', items: [
    ['voices', '6–8 interviews, family voices included'], ['film', 'A 25–30 minute documentary'],
    ['book', 'A 10,000–15,000 word legacy book'], ['archive', 'An expanded digital archive'] ] },
  institution: { name: 'Legacy Institution', items: [
    ['voices', '8–12 stakeholder interviews'], ['film', 'A 30–45 minute documentary'],
    ['book', 'A heritage & legacy book'], ['archive', 'An institutional digital archive'] ] }
};
const ADDONS = [
  { id: 'copies', icon: 'copies', t: 'Extra printed copies', d: 'More copies of the book for children, grandchildren and close friends.' },
  { id: 'collector', icon: 'star', t: 'Collector’s edition', d: 'Cloth-bound, numbered copies made to last for generations.' },
  { id: 'voices', icon: 'voices', t: 'Additional family voices', d: 'More interviews with family, friends or colleagues.' },
  { id: 'unveiling', icon: 'candle', t: 'The Unveiling evening', d: 'A hosted evening to premiere the film and present the book.' },
  { id: 'box', icon: 'gift', t: 'Keepsake legacy box', d: 'The book, the film and chosen printed photographs, presented together.' },
  { id: 'letters', icon: 'letter', t: 'Letters to the next generation', d: 'Recorded messages from the storyteller to children and grandchildren.' },
  { id: 'tree', icon: 'tree', t: 'Family tree & heritage map', d: 'An illustrated family tree and a map of the places that shaped the story.' },
  { id: 'website', icon: 'web', t: 'Private family legacy website', d: 'A password-protected page where the family can watch, read and share.' },
  { id: 'followup', icon: 'cal', t: 'The next chapter', d: 'A follow-up interview a year or more later, added to the archive.' },
  { id: 'exhibit', icon: 'frame', t: 'Heritage exhibition panels', d: 'Printed panels telling the institution’s story for offices and anniversaries.', only: ['institution'] }
];

const exLineup = document.getElementById('exLineup');
const exAddons = document.getElementById('exAddons');
const exLabel = document.getElementById('exLabel');
const exSummary = document.getElementById('exSummary');
const exCta = document.getElementById('exCta');
const exPkgBtns = Array.from(document.querySelectorAll('.ex-pkg'));
let currentPkg = 'portrait';
const chosen = new Set();

const icon = id => `<svg class="ico" aria-hidden="true"><use href="#i-${id}"/></svg>`;

function renderAddons() {
  exAddons.innerHTML = '';
  ADDONS.forEach(a => {
    if (a.only && !a.only.includes(currentPkg)) { chosen.delete(a.id); return; }
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ex-addon';
    b.setAttribute('aria-pressed', chosen.has(a.id) ? 'true' : 'false');
    b.innerHTML = `<span class="box"></span><span><b>${a.t}</b><small>${a.d}</small></span>`;
    b.addEventListener('click', () => {
      chosen.has(a.id) ? chosen.delete(a.id) : chosen.add(a.id);
      b.setAttribute('aria-pressed', chosen.has(a.id) ? 'true' : 'false');
      renderLineup();
    });
    exAddons.appendChild(b);
  });
}

function renderLineup() {
  const pkg = PACKAGES[currentPkg];
  exLabel.textContent = `The ${pkg.name} includes`;
  let html = pkg.items.map(([ic, t]) => `<div class="ex-item">${icon(ic)}<span>${t}</span></div>`).join('');
  const picked = ADDONS.filter(a => chosen.has(a.id));
  html += picked.map(a => `<div class="ex-item addon">${icon(a.icon)}<em>Add-on</em><span>${a.t}</span></div>`).join('');
  exLineup.innerHTML = html;
  exSummary.textContent = picked.length
    ? `${pkg.name}, with ${picked.map(a => a.t.toLowerCase()).join(', ')}.`
    : `${pkg.name}. Add anything you’d like, or discuss it with us first.`;
}

function selectPkg(key) {
  currentPkg = key;
  exPkgBtns.forEach(b => {
    const on = b.dataset.pkg === key;
    b.classList.toggle('active', on);
    b.setAttribute('aria-checked', on ? 'true' : 'false');
  });
  renderAddons();
  renderLineup();
}

if (exLineup) {
  exPkgBtns.forEach(b => b.addEventListener('click', () => selectPkg(b.dataset.pkg)));
  document.querySelectorAll('.pkg-see').forEach(a => a.addEventListener('click', () => selectPkg(a.dataset.pkg)));
  selectPkg(currentPkg);

  // Carry the selection into the enquiry form
  let autoFilled = '';
  exCta.addEventListener('click', () => {
    const msg = document.getElementById('fmessage');
    const rel = document.getElementById('frelation');
    const pkg = PACKAGES[currentPkg];
    const picked = ADDONS.filter(a => chosen.has(a.id)).map(a => a.t);
    const text = `I'm interested in the ${pkg.name}` + (picked.length ? `, with: ${picked.join(', ')}.` : '.') + '\n\n';
    if (msg && (msg.value.trim() === '' || msg.value === autoFilled)) { msg.value = text; autoFilled = text; }
    if (rel && currentPkg === 'institution') rel.value = 'Our company or institution';
  });
}

// ---------- Sample interview: load the YouTube player on click ----------
document.querySelectorAll('.video-slot[data-yt]').forEach(slot => {
  slot.addEventListener('click', e => {
    e.preventDefault();
    const id = slot.dataset.yt;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.title = 'Sample Legacy Project interview';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    const wrap = document.createElement('div');
    wrap.className = 'video-slot playing';
    wrap.appendChild(frame);
    slot.replaceWith(wrap);
  });
});

// ---------- Archive mockup: draw a static waveform ----------
(function () {
  const wave = document.getElementById('mbWave');
  if (!wave) return;
  let seed = 7;
  const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const bars = 64, played = 24;
  for (let i = 0; i < bars; i++) {
    const env = 0.35 + 0.65 * Math.abs(Math.sin(i / 7.5)) * (0.6 + 0.4 * Math.sin(i / 3.1 + 1));
    const h = Math.max(12, Math.round(env * (0.55 + 0.45 * rand()) * 100));
    const b = document.createElement('i');
    b.style.height = h + '%';
    if (i < played) b.className = 'p';
    wave.appendChild(b);
  }
})();
