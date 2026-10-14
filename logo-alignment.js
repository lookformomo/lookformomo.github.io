/* Center the visible logo artwork instead of any surrounding image padding.
   The original source images remain unchanged. A centered contain-fit image
   remains available when a remote server does not allow canvas measurement. */
function findLogoInkBounds(pixels, width, height) {
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      if (pixels[offset + 3] > 32 && Math.min(pixels[offset], pixels[offset + 1], pixels[offset + 2]) < 245) {
        left = Math.min(left, x); right = Math.max(right, x);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
  }
  return right < left ? null : {left, top, width: right - left + 1, height: bottom - top + 1};
}

function fitLogoArtwork(bounds, canvasWidth, canvasHeight, frameWidth, frameHeight) {
  const area = Math.min(frameWidth * frameHeight * .5, 12000);
  const scale = Math.min(Math.sqrt(area / (bounds.width * bounds.height)), frameWidth * .96 / bounds.width, frameHeight * .88 / bounds.height);
  return {
    width: canvasWidth * scale, height: canvasHeight * scale,
    left: frameWidth / 2 - (bounds.left + bounds.width / 2) * scale,
    top: frameHeight / 2 - (bounds.top + bounds.height / 2) * scale
  };
}

document.querySelectorAll('.experience-logo-frame').forEach(frame => {
  const img = frame.querySelector('img');
  if (!img) return;
  let measurement = null;
  const position = () => {
    if (!measurement || !frame.clientWidth || !frame.clientHeight) return;
    const fit = fitLogoArtwork(measurement.bounds, measurement.width, measurement.height, frame.clientWidth, frame.clientHeight);
    Object.assign(img.style, {
      width: `${fit.width}px`, height: `${fit.height}px`,
      left: `${fit.left}px`, top: `${fit.top}px`,
      transform: 'none', objectFit: 'fill'
    });
  };
  const probe = new Image();
  probe.crossOrigin = 'anonymous';
  probe.referrerPolicy = 'no-referrer';
  probe.onload = () => {
    try {
      const ratio = Math.min(1, 768 / Math.max(probe.naturalWidth, probe.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(probe.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(probe.naturalHeight * ratio));
      const context = canvas.getContext('2d', {willReadFrequently: true});
      if (!context) return;
      context.drawImage(probe, 0, 0, canvas.width, canvas.height);
      const bounds = findLogoInkBounds(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
      if (bounds) {
        measurement = {bounds, width: canvas.width, height: canvas.height};
        position();
      }
    } catch (_) { /* Keep the original centered image if measurement is unavailable. */ }
  };
  probe.onerror = () => {};
  probe.src = img.currentSrc || img.src;
  if (typeof ResizeObserver === 'function') new ResizeObserver(position).observe(frame);
  else window.addEventListener('resize', position, {passive: true});
});
