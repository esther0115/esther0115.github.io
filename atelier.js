const cover = document.querySelector('.cover');
const light = document.querySelector('#light');
const motion = document.querySelector('#motion');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const dialog = document.querySelector('#guide');

function pauseWater(paused) {
  cover.classList.toggle('still', paused);
  motion.textContent = paused ? '播放水流 ▷' : '暂停水流 Ⅱ';
  motion.setAttribute('aria-pressed', paused);
}
pauseWater(preference.matches);
preference.addEventListener('change', event => pauseWater(event.matches));
motion.onclick = () => pauseWater(!cover.classList.contains('still'));
light.onclick = () => {
  const day = cover.classList.toggle('day');
  light.textContent = day ? '切到暮色 ☾' : '切到晨光 ☼';
};
document.querySelector('.guide-index').onclick = () => dialog.showModal();
dialog.addEventListener('click', event => {
  if (event.target.closest('a') || event.target === dialog) dialog.close();
});
const markers = [...document.querySelectorAll('.directory a')];
function updateNavigation() {
  const current = [...document.querySelectorAll('.room')].filter(room =>
    room.getBoundingClientRect().top < window.innerHeight * 0.52
  ).pop();
  for (const marker of markers) {
    if (current && marker.dataset.room === current.id) marker.setAttribute('aria-current','location');
    else marker.removeAttribute('aria-current');
  }
}
let scheduled = false;
window.addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { updateNavigation(); scheduled = false; });
}, {passive:true});
updateNavigation();

for (const figure of document.querySelectorAll('.portrait figure')) {
  const frame = figure.querySelector('.duo');
  const slider = figure.querySelector('.wipe');
  const choices = figure.querySelectorAll('[data-cut]');
  function showCut(value) {
    slider.value = value;
    frame.style.setProperty('--cut', value + '%');
    slider.setAttribute('aria-valuetext', '场景 ' + value + '%，速写 ' + (100 - value) + '%');
    for (const button of choices) button.setAttribute('aria-pressed', button.dataset.cut === String(value));
  }
  showCut(slider.value);
  slider.addEventListener('input', () => showCut(slider.value));
  for (const button of choices) button.onclick = () => showCut(button.dataset.cut);
}
