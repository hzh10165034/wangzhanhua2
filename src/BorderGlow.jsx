import { useCallback, useEffect, useRef } from 'react';
import './BorderGlow.css';

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const GRADIENT_KEYS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];
const DEFAULT_COLORS = ['#c084fc', '#f472b6', '#38bdf8'];

function buildGlowVars(color, intensity) {
  const values = color.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  const [h, s, l] = values ? values.slice(1).map(Number) : [40, 80, 80];
  return Object.fromEntries([100, 60, 50, 40, 30, 20, 10].map(level => [
    `--glow-color${level === 100 ? '' : `-${level}`}`,
    `hsl(${h}deg ${s}% ${l}% / ${Math.min(level * intensity, 100)}%)`,
  ]));
}

function buildGradientVars(colors) {
  const palette = colors.length ? colors : DEFAULT_COLORS;
  const vars = Object.fromEntries(GRADIENT_KEYS.map((key, index) => [
    `--gradient-${key}`,
    `radial-gradient(at ${GRADIENT_POSITIONS[index]}, ${palette[Math.min(COLOR_MAP[index], palette.length - 1)]} 0px, transparent 50%)`,
  ]));
  return { ...vars, '--gradient-base': `linear-gradient(${palette[0]} 0 100%)` };
}

export default function BorderGlow({
  as: Element = 'div',
  children,
  className = '',
  edgeSensitivity = 30,
  glowColor = '40 80 80',
  backgroundColor = '#120F17',
  borderRadius = 6,
  glowRadius = 40,
  glowIntensity = 1,
  coneSpread = 25,
  colors = DEFAULT_COLORS,
  fillOpacity = 0.5,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}) {
  const cardRef = useRef(null);
  const frameRef = useRef(0);
  const pointerRef = useRef(null);
  const reducedMotionRef = useRef(false);

  const cancelFrame = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      reducedMotionRef.current = preference.matches;
      if (preference.matches) {
        cancelFrame();
        cardRef.current?.style.setProperty('--cursor-angle', '45deg');
        cardRef.current?.style.setProperty('--edge-proximity', '100');
      }
    };
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => {
      cancelFrame();
      preference.removeEventListener('change', updatePreference);
    };
  }, [cancelFrame]);

  const handlePointerMove = useCallback(event => {
    onPointerMove?.(event);
    if (event.pointerType === 'touch' || reducedMotionRef.current) return;
    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (frameRef.current) return;
    // Coalesce pointer events into one geometry read per rendered frame.
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      if (!cx || !cy) return;
      const dx = pointerRef.current.x - rect.left - cx;
      const dy = pointerRef.current.y - rect.top - cy;
      const edge = Math.min(Math.max(Math.abs(dx) / cx, Math.abs(dy) / cy), 1);
      const angle = (Math.atan2(dy, dx) * 180 / Math.PI + 450) % 360;
      card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
      card.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    });
  }, [onPointerMove]);

  return (
    <Element
      {...props}
      ref={cardRef}
      type={Element === 'button' ? (props.type || 'button') : undefined}
      className={`border-glow-card ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={event => { cancelFrame(); onPointerLeave?.(event); }}
      style={{
        '--card-bg': backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius': `${borderRadius}px`,
        '--glow-padding': `${glowRadius}px`,
        '--cone-spread': coneSpread,
        '--fill-opacity': fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
        ...style,
      }}
    >
      {children}
      <span className="edge-light" aria-hidden="true" />
    </Element>
  );
}
