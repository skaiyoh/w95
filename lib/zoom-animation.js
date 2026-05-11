(function () {
  const FRAME_CLASS = 'w95-zoom-frame';
  const BLOCKER_CLASS = 'w95-zoom-blocker';
  const DEFAULT_STEPS = 6;
  const DEFAULT_FRAME_MS = 22;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpRect(src, dst, t) {
    return {
      x: lerp(src.x, dst.x, t),
      y: lerp(src.y, dst.y, t),
      w: lerp(src.w, dst.w, t),
      h: lerp(src.h, dst.h, t),
    };
  }

  function buildFrames(src, dst, steps) {
    const frames = [];
    for (let i = 1; i <= steps; i++) {
      frames.push(lerpRect(src, dst, i / steps));
    }
    return frames;
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function makeBlocker() {
    const el = document.createElement('div');
    el.className = BLOCKER_CLASS;
    return el;
  }

  function makeFrameEl(rect) {
    const el = document.createElement('div');
    el.className = FRAME_CLASS;
    el.style.left = rect.x + 'px';
    el.style.top = rect.y + 'px';
    el.style.width = Math.max(0, rect.w) + 'px';
    el.style.height = Math.max(0, rect.h) + 'px';
    return el;
  }

  function runZoomAnimation(srcRect, dstRect, opts) {
    opts = opts || {};
    const steps = opts.steps || DEFAULT_STEPS;
    const frameMs = opts.frameMs || DEFAULT_FRAME_MS;
    const direction = opts.direction || 'forward';

    if (prefersReducedMotion() || !srcRect || !dstRect) {
      return Promise.resolve();
    }

    const src = direction === 'reverse' ? dstRect : srcRect;
    const dst = direction === 'reverse' ? srcRect : dstRect;
    const frames = buildFrames(src, dst, steps);

    const blocker = makeBlocker();
    document.body.appendChild(blocker);

    return new Promise((resolve) => {
      let i = 0;
      let current = null;

      function tick() {
        if (current && current.parentNode) current.parentNode.removeChild(current);
        if (i >= frames.length) {
          if (blocker.parentNode) blocker.parentNode.removeChild(blocker);
          resolve();
          return;
        }
        current = makeFrameEl(frames[i]);
        document.body.appendChild(current);
        i++;
        setTimeout(tick, frameMs);
      }

      tick();
    });
  }

  window.W95Zoom = { run: runZoomAnimation };
})();
