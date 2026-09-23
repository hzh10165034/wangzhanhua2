import { memo, useEffect, useRef } from 'react';
import './DotField.css';

const TWO_PI = Math.PI * 2;

const DotField = memo(({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = 'rgba(168, 85, 247, 0.35)',
  gradientTo = 'rgba(180, 151, 207, 0.25)',
  glowColor = '#120F17',
  className = '',
  ...rest
}) => {
  const canvasRef = useRef(null);
  const glowRef = useRef(null);
  const dotsRef = useRef([]);
  const rafRef = useRef(0);
  const visibleRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0, offsetX: 0, offsetY: 0 });
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 });
  const glowOpacity = useRef(0);
  const engagement = useRef(0);
  const propsRef = useRef({});
  const rebuildRef = useRef(null);
  const glowIdRef = useRef(`dot-field-glow-${Math.random().toString(36).slice(2, 9)}`);

  propsRef.current = { dotRadius, dotSpacing, cursorRadius, bulgeOnly, bulgeStrength, sparkle, waveAmplitude, gradientFrom, gradientTo };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let resizeTimer;
    let frameCount = 0;
    let lastFrameAt = 0;

    const buildDots = (w, h) => {
      const p = propsRef.current;
      const step = Math.max(2, p.dotRadius + p.dotSpacing);
      const cols = Math.ceil(w / step) + 1;
      const rows = Math.ceil(h / step) + 1;
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      const dots = new Array(rows * cols);
      let index = 0;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots[index++] = { ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay };
        }
      }
      dotsRef.current = dots;
    };

    const doResize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h, offsetX: rect.left + window.scrollX, offsetY: rect.top + window.scrollY };
      buildDots(w, h);
    };
    const resize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 80);
    };

    const onMouseMove = event => {
      const size = sizeRef.current;
      mouseRef.current.x = event.pageX - size.offsetX;
      mouseRef.current.y = event.pageY - size.offsetY;
    };
    const updateMouseSpeed = () => {
      const mouse = mouseRef.current;
      const dx = mouse.prevX - mouse.x;
      const dy = mouse.prevY - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      mouse.speed += (distance - mouse.speed) * 0.5;
      if (mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
    };
    const tick = timestamp => {
      if (timestamp - lastFrameAt < 1000 / 30) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastFrameAt = timestamp;
      frameCount += 1;
      updateMouseSpeed();
      const dots = dotsRef.current;
      const mouse = mouseRef.current;
      const { w, h } = sizeRef.current;
      const p = propsRef.current;
      const engagementTarget = Math.min(mouse.speed / 5, 1);
      engagement.current += (engagementTarget - engagement.current) * 0.06;
      const engagementValue = engagement.current;
      glowOpacity.current += (engagementValue - glowOpacity.current) * 0.08;
      if (glowRef.current) {
        glowRef.current.setAttribute('cx', mouse.x);
        glowRef.current.setAttribute('cy', mouse.y);
        glowRef.current.style.opacity = glowOpacity.current;
      }

      ctx.clearRect(0, 0, w, h);
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, p.gradientFrom);
      gradient.addColorStop(1, p.gradientTo);
      ctx.fillStyle = gradient;
      const cursorRadiusSquared = p.cursorRadius * p.cursorRadius;
      const radius = p.dotRadius / 2;
      const time = frameCount * 0.02;
      ctx.beginPath();

      for (let i = 0; i < dots.length; i += 1) {
        const dot = dots[i];
        const dx = mouse.x - dot.ax;
        const dy = mouse.y - dot.ay;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < cursorRadiusSquared && engagementValue > 0.01) {
          const distance = Math.sqrt(distanceSquared);
          const influence = 1 - distance / p.cursorRadius;
          const push = influence * influence * p.bulgeStrength * engagementValue;
          const angle = Math.atan2(dy, dx);
          dot.sx += (dot.ax - Math.cos(angle) * push - dot.sx) * 0.15;
          dot.sy += (dot.ay - Math.sin(angle) * push - dot.sy) * 0.15;
        } else if (p.bulgeOnly) {
          dot.sx += (dot.ax - dot.sx) * 0.1;
          dot.sy += (dot.ay - dot.sy) * 0.1;
        }
        let drawX = dot.sx;
        let drawY = dot.sy;
        if (p.waveAmplitude > 0) {
          drawY += Math.sin(dot.ax * 0.03 + time) * p.waveAmplitude;
          drawX += Math.cos(dot.ay * 0.03 + time * 0.7) * p.waveAmplitude * 0.5;
        }
        const isSparkle = p.sparkle && ((((i * 2654435761) ^ (frameCount >> 3)) >>> 0) % 100 < 3);
        const drawRadius = isSparkle ? radius * 1.8 : radius;
        ctx.moveTo(drawX + drawRadius, drawY);
        ctx.arc(drawX, drawY, drawRadius, 0, TWO_PI);
      }
      ctx.fill();
      rafRef.current = visibleRef.current && !reduceMotion ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (reduceMotion) {
        if (visibleRef.current) tick(performance.now());
      } else if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = !!entry?.isIntersecting && !document.hidden;
      if (visibleRef.current) start(); else stop();
    }, { rootMargin: '160px' });
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (visibleRef.current) start();
    };

    doResize();
    observer.observe(container);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    rebuildRef.current = () => buildDots(sizeRef.current.w, sizeRef.current.h);

    return () => {
      stop();
      observer.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  useEffect(() => { rebuildRef.current?.(); }, [dotRadius, dotSpacing]);

  return (
    <div className={`dot-field-container ${className}`} {...rest}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <svg aria-hidden="true">
        <defs>
          <radialGradient id={glowIdRef.current}>
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle ref={glowRef} cx="-9999" cy="-9999" r={glowRadius} fill={`url(#${glowIdRef.current})`} />
      </svg>
    </div>
  );
});

DotField.displayName = 'DotField';

export default DotField;
