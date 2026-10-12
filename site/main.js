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
