// Mobil menü
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', false);
  })
);

// Évszám a láblécben
document.getElementById('year').textContent = new Date().getFullYear();

// Fájlméret-ellenőrzés (8 MB)
const fileInput = document.querySelector('input[type=file]');
fileInput?.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file && file.size > 8 * 1024 * 1024) {
    alert('A fájl túl nagy (max. 8 MB). Kérjük, küldje e-mailben.');
    fileInput.value = '';
  }
});

// Megjelenési animáció görgetéskor
const revealTargets = document.querySelectorAll('.card, .steps li, .price-card, .quote, .why-list li');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}
