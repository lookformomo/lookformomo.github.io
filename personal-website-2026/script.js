const lenses = {"perception": ["01 / CULTURE, LEARNING & COLOR PERCEPTION", "How can experience and learning shape internal representations?"], "design": ["02 / PRODUCT DESIGN", "How can better design solve problems while creating a seamless experience?"], "story": ["03 / STORYTELLING", "What makes a convincing fiction?"]};
document.getElementById('lens-count').textContent = lenses.perception[0];
document.getElementById('lens-copy').textContent = lenses.perception[1];
document.querySelectorAll('[data-lens]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.lens;
  document.querySelector('.mind-scene').dataset.active = key;
  document.querySelectorAll('[data-mind-layer]').forEach(layer => { layer.classList.toggle('is-visible', layer.dataset.mindLayer === key); layer.setAttribute('aria-hidden', String(layer.dataset.mindLayer !== key)); });
  document.getElementById('lens-count').textContent = lenses[key][0];
  document.getElementById('lens-copy').textContent = lenses[key][1];
  document.querySelectorAll('[data-lens]').forEach(other => {
    other.classList.toggle('selected', other === button);
    other.setAttribute('aria-pressed', String(other === button));
  });
}));
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
document.querySelectorAll('.organization-logo').forEach(img => {
  const fallback = () => { img.hidden = true; img.nextElementSibling.hidden = false; };
  img.addEventListener('error', fallback);
  if (img.complete && !img.naturalWidth) fallback();
});

// Choose three unique characters per cycle; parent placement and angle stay fixed.
const perceptionCharacters = Array.from(document.querySelectorAll('.sprinkled-character'));
const characterMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
function turnThreeCharacters() {
  if (document.hidden || characterMotionPreference.matches) return;
  const available = [...perceptionCharacters];
  for (let count = 0; count < Math.min(3, perceptionCharacters.length); count++) {
    const index = Math.floor(Math.random() * available.length);
    const character = available.splice(index, 1)[0];
    character.classList.add('is-turning');
  }
}
perceptionCharacters.forEach(character => character.addEventListener('animationend', () => character.classList.remove('is-turning')));
setInterval(turnThreeCharacters, 3000);
