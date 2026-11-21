document.documentElement.classList.add('js');

const bar = document.querySelector('.bar');
const hero = document.querySelector('.hero');
const onScroll = () => bar.classList.toggle('solid', window.scrollY > hero.offsetHeight - 80);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

function countUp(el) {
  const end = parseFloat(el.dataset.count);
  const dec = Number(el.dataset.dec || 0);
  if (still || Number.isNaN(end)) return;
  const t0 = performance.now(), dur = 900;
  const tick = (t) => {
    const k = Math.min((t - t0) / dur, 1);
    const eased = 1 - Math.pow(1 - k, 3);
    el.textContent = (end * eased).toFixed(dec);
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add('in');
    const n = e.target.querySelector('[data-count]');
    if (n) countUp(n);
    io.unobserve(e.target);
  }
}, { threshold: 0.4 });
document.querySelectorAll('.stat').forEach((s) => io.observe(s));

// EN/RU switch keeps the reader's place: both pages share the section ids, so the link carries the section in view
// (2026-11-09; before, switching language from «Lessons» or the FAQ jumped back to the top)
document.querySelectorAll('.lang a:not([aria-current])').forEach((a) => {
  a.addEventListener('click', () => {
    const secs = [...document.querySelectorAll('main [id], body > section[id], section[id]')];
    const here = secs.filter((s) => s.getBoundingClientRect().top <= innerHeight * 0.4).pop();
    if (here && here.id !== 'top') a.href = a.getAttribute('href').split('#')[0] + '#' + here.id;
  });
});
