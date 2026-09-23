import { useEffect, useRef } from 'react';
import { Renderer, Triangle, Program, Mesh } from 'ogl';

function Prism({
  height = 3.5,
  baseWidth = 5.5,
  animationType = '3drotate',
  glow = 1.2,
  offset = { x: 0, y: 0 },
  noise = 0.16,
  transparent = true,
  scale = 3.8,
  hueShift = 0.3,
  colorFrequency = 1.15,
  bloom = 1.2,
  suspendWhenOffscreen = true,
  timeScale = 0.22,
  lightMode = false,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const H = Math.max(0.001, height);
    const BASE_HALF = Math.max(0.001, baseWidth * 0.5);
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    let renderer;

    try {
      renderer = new Renderer({ dpr, alpha: transparent, antialias: false });
    } catch {
      container.dataset.webgl = 'unsupported';
      return undefined;
    }

    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    Object.assign(gl.canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
    });
    container.appendChild(gl.canvas);

    const vertex = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;

    const fragment = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform mat3 uRot;
      uniform float uGlow;
      uniform float uNoise;
      uniform float uSaturation;
      uniform float uHueShift;
      uniform float uColorFreq;
      uniform float uBloom;
      uniform float uCenterShift;
      uniform float uInvBaseHalf;
      uniform float uInvHeight;
      uniform float uMinAxis;
      uniform float uPxScale;
      uniform float uTimeScale;
      uniform float uLightMode;

      vec4 tanh4(vec4 x) {
        vec4 e2x = exp(2.0 * x);
        return (e2x - 1.0) / (e2x + 1.0);
      }

      float rand(vec2 co) {
        return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float sdOctaAnisoInv(vec3 p) {
        vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
        return (q.x + q.y + q.z - 1.0) * uMinAxis * 0.5773502691896258;
      }

      float sdPyramidUpInv(vec3 p) {
        return max(sdOctaAnisoInv(p), -p.y);
      }

      mat3 hueRotation(float a) {
        float c = cos(a), s = sin(a);
        mat3 W = mat3(0.299,0.587,0.114, 0.299,0.587,0.114, 0.299,0.587,0.114);
        mat3 U = mat3(0.701,-0.587,-0.114, -0.299,0.413,-0.114, -0.300,-0.588,0.886);
        mat3 V = mat3(0.168,-0.331,0.500, 0.328,0.035,-0.500, -0.497,0.296,0.201);
        return W + U * c + V * s;
      }

      void main() {
        vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy) * uPxScale;
        float z = 5.0;
        vec4 o = vec4(0.0);
        float cf = uColorFreq;

        for (int i = 0; i < 72; i++) {
          vec3 p = uRot * vec3(f, z);
          p.y += uCenterShift;
          float d = 0.1 + 0.2 * abs(sdPyramidUpInv(p));
          z -= d;
          o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
        }

        o = tanh4(o * o * (uGlow * uBloom) / 72000.0);
        vec3 col = o.rgb;
        col += (rand(gl_FragCoord.xy + vec2(iTime)) - 0.5) * uNoise;
        col = clamp(col, 0.0, 1.0);
        float luminance = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = clamp(mix(vec3(luminance), col, uSaturation), 0.0, 1.0);
        col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);

        if (uLightMode > 0.5) {
          float peak = max(col.r, max(col.g, col.b));
          vec3 chroma = pow(clamp(col / max(peak, 0.0001), 0.0, 1.0), vec3(1.14));
          gl_FragColor = vec4(mix(vec3(1.0), chroma, o.a * 0.94), 1.0);
        } else {
          gl_FragColor = vec4(col, o.a);
        }
      }
    `;

    const geometry = new Triangle(gl);
    const resolution = new Float32Array(2);
    const rotation = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: resolution },
        iTime: { value: 0 },
        uRot: { value: rotation },
        uGlow: { value: glow },
        uNoise: { value: noise },
        uSaturation: { value: transparent ? 1.5 : 1 },
        uHueShift: { value: hueShift },
        uColorFreq: { value: colorFrequency },
        uBloom: { value: bloom },
        uCenterShift: { value: H * 0.25 },
        uInvBaseHalf: { value: 1 / BASE_HALF },
        uInvHeight: { value: 1 / H },
        uMinAxis: { value: Math.min(BASE_HALF, H) },
        uPxScale: { value: 1 },
        uTimeScale: { value: reduceMotion ? 0 : timeScale },
        uLightMode: { value: lightMode ? 1 : 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = container.clientWidth || 1;
      const heightPx = container.clientHeight || 1;
      renderer.setSize(width, heightPx);
      resolution[0] = gl.drawingBufferWidth;
      resolution[1] = gl.drawingBufferHeight;
      program.uniforms.uPxScale.value = 1 / ((gl.drawingBufferHeight || 1) * 0.1 * scale);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const setRotation = (yaw, pitch, roll) => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cx = Math.cos(pitch), sx = Math.sin(pitch);
      const cz = Math.cos(roll), sz = Math.sin(roll);
      rotation[0] = cy * cz + sy * sx * sz;
      rotation[1] = cx * sz;
      rotation[2] = -sy * cz + cy * sx * sz;
      rotation[3] = -cy * sz + sy * sx * cz;
      rotation[4] = cx * cz;
      rotation[5] = sy * sz + cy * sx * cz;
      rotation[6] = sy * cx;
      rotation[7] = -sx;
      rotation[8] = cy * cx;
    };

    let raf = 0;
    const startedAt = performance.now();
    const render = timestamp => {
      const time = (timestamp - startedAt) * 0.001;
      program.uniforms.iTime.value = time;
      const scaled = time * (reduceMotion ? 0 : timeScale);
      setRotation(scaled * 0.34, Math.sin(scaled * 0.22) * 0.42, Math.sin(scaled * 0.16) * 0.22);
      renderer.render({ scene: mesh });
      if (!reduceMotion) raf = requestAnimationFrame(render);
    };
    const start = () => {
      if (reduceMotion) {
        render(performance.now());
      } else if (!raf) {
        raf = requestAnimationFrame(render);
      }
    };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    let intersectionObserver;

    if (suspendWhenOffscreen) {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) start();
        else stop();
      }, { rootMargin: '240px' });
      intersectionObserver.observe(container);
    } else {
      start();
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      gl.canvas.remove();
    };
  }, [height, baseWidth, glow, noise, transparent, scale, hueShift, colorFrequency, bloom, suspendWhenOffscreen, timeScale, lightMode]);

  return <div className="prism-container" ref={containerRef} aria-hidden="true" />;
}

export default Prism;
