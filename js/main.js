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

// Contact form — submits to Formspree (see setup note in the HTML comment above the form)
const form = document.getElementById('legacyForm');
const formFields = document.getElementById('formFields');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.classList.remove('show');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' },
    });
    if (response.ok) {
      formFields.style.display = 'none';
      formSuccess.classList.add('show');
    } else {
      throw new Error('Submission failed');
    }
  } catch (err) {
    formError.classList.add('show');
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});
