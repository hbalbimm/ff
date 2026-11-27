// Mobile nav toggle + need-picker chips. Progressive enhancement only.
document.querySelectorAll('.nav-toggle').forEach((btn) => {
  const nav = document.getElementById(btn.getAttribute('aria-controls'));
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
});
document.querySelectorAll('.need-picker .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    chip.closest('.chips').querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');
  });
});
