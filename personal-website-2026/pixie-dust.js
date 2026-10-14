(() => {
  const canvas = document.getElementById('pixie-dust');
  const toggle = document.getElementById('dust-toggle');
  const context = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let optedIn = true;
  try { optedIn = localStorage.getItem('momo-pixie-dust') !== 'off'; } catch (_) {}
  let particles = [], frame = 0, previousTime = 0, lastEmission = 0;
  let width = innerWidth, height = innerHeight;
  const allowed = () => optedIn && !reduced.matches && fine.matches && !document.hidden && !!context;
  function reset() {
    cancelAnimationFrame(frame); frame = 0; particles = []; previousTime = 0;
    if (context) context.clearRect(0, 0, width, height);
  }
  function updateControl() {
    const on = allowed();
    toggle.textContent = on ? '✦' : '✧';
    toggle.setAttribute('aria-label', on ? 'Turn cursor trail off' : 'Turn cursor trail on');
    toggle.setAttribute('aria-pressed', String(on));
    toggle.disabled = reduced.matches || !fine.matches || !context;
    if (!on) reset();
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function animate(now) {
    if (!allowed()) { reset(); return; }
    const elapsed = Math.min(previousTime ? now - previousTime : 16, 40);
    previousTime = now;
    context.clearRect(0, 0, width, height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.life -= elapsed; p.x += p.vx * elapsed / 16; p.y += p.vy * elapsed / 16;
      p.vy += .025 * elapsed / 16;
      const alpha = Math.max(0, p.life / p.duration);
      const size = p.size * (.3 + alpha * .7);
      context.save(); context.translate(p.x, p.y); context.rotate(p.rotation);
      context.globalAlpha = alpha; context.fillStyle = p.color;
      context.shadowColor = p.color; context.shadowBlur = 5 * alpha;
      context.beginPath();
      context.moveTo(0, -size * 2); context.lineTo(size * .4, -size * .4);
      context.lineTo(size * 2, 0); context.lineTo(size * .4, size * .4);
      context.lineTo(0, size * 2); context.lineTo(-size * .4, size * .4);
      context.lineTo(-size * 2, 0); context.lineTo(-size * .4, -size * .4);
      context.closePath(); context.fill(); context.restore();
    });
    if (particles.length) frame = requestAnimationFrame(animate);
    else { frame = 0; previousTime = 0; context.clearRect(0, 0, width, height); }
  }
  window.addEventListener('pointermove', event => {
    if (!allowed() || event.pointerType === 'touch' || event.buttons || performance.now() - lastEmission < 18) return;
    lastEmission = performance.now();
    for (let i = 0; i < 3; i++) {
      const duration = 450 + Math.random() * 500;
      particles.push({x: event.clientX + (Math.random() - .5) * 12, y: event.clientY + (Math.random() - .5) * 12,
        vx: (Math.random() - .5) * .7, vy: Math.random() * .5 - .2, size: 1 + Math.random() * 1.4,
        life: duration, duration, rotation: Math.random() * Math.PI,
        color: ['#e6b958', '#ffe6a3', '#a6dce9'][Math.floor(Math.random() * 3)]});
    }
    if (particles.length > 100) particles.splice(0, particles.length - 100);
    if (!frame) frame = requestAnimationFrame(animate);
  }, {passive: true});
  toggle.addEventListener('click', () => {
    optedIn = !optedIn;
    try { localStorage.setItem('momo-pixie-dust', optedIn ? 'on' : 'off'); } catch (_) {}
    updateControl();
  });
  window.addEventListener('resize', resize, {passive: true});
  reduced.addEventListener('change', updateControl); fine.addEventListener('change', updateControl);
  document.addEventListener('visibilitychange', updateControl);
  resize(); updateControl();
})();
