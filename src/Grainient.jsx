import { useEffect, useRef } from 'react';
import { Renderer, Triangle, Program, Mesh } from 'ogl';
import './Grainient.css';

const clampDpr = () => Math.min(window.devicePixelRatio || 1, 1.5);

function Grainient({
  className = '',
  timeSpeed = 0.16,
  warpStrength = 1.15,
  warpFrequency = 4.5,
  warpSpeed = 1.6,
  rotationAmount = 320,
  noiseScale = 2,
  grainAmount = 0.06,
  contrast = 1.35,
  saturation = 0.95,
  zoom = 0.92,
  color1 = '#ff3b24',
  color2 = '#171112',
  color3 = '#080808',
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer;
    try {
      renderer = new Renderer({ dpr: clampDpr(), alpha: true, antialias: false });
    } catch {
      root.dataset.webgl = 'unsupported';
      return undefined;
    }

    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);
    Object.assign(gl.canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
    root.appendChild(gl.canvas);

    const vertex = `#version 300 es
      in vec2 position;
      void main(){ gl_Position = vec4(position, 0.0, 1.0); }
    `;
    const fragment = `#version 300 es
      precision highp float;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uSpeed;
      uniform float uWarp;
      uniform float uFrequency;
      uniform float uWarpSpeed;
      uniform float uRotation;
      uniform float uNoiseScale;
      uniform float uGrain;
      uniform float uContrast;
      uniform float uSaturation;
      uniform float uZoom;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      out vec4 outColor;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
      }
      float fbm(vec2 p){
        float v=0.0, a=.5;
        for(int i=0;i<4;i++){ v += a*noise(p); p=p*2.03+vec2(17.1,9.2); a*=.5; }
        return v;
      }
      mat2 rot(float a){ float s=sin(a),c=cos(a); return mat2(c,-s,s,c); }
      void main(){
        vec2 uv=gl_FragCoord.xy/uResolution.xy;
        vec2 p=(uv-.5); p.x*=uResolution.x/uResolution.y; p*=uZoom;
        p=rot(uRotation*.002)*p;
        float t=uTime*uSpeed;
        vec2 q=p;
        q += vec2(sin(p.y*uFrequency+t*uWarpSpeed), cos(p.x*uFrequency*.82-t*uWarpSpeed*.7))*uWarp*.12;
        float n=fbm(q*uNoiseScale+vec2(t*.18,-t*.12));
        float sweep=0.5+0.5*sin((q.x*.8+q.y*.55+n*.8)*2.6+t*.45);
        float red=max(0.,1.-length(q-vec2(.28,-.04))*.9);
        vec3 col=mix(uColor3,uColor2,smoothstep(.12,.72,n));
        col=mix(col,uColor1,smoothstep(.55,1.0,sweep)*red*.92);
        col += (n-.5)*.11;
        float lum=dot(col,vec3(.2126,.7152,.0722));
        col=mix(vec3(lum),col,uSaturation);
        col=(col-.5)*uContrast+.5;
        float grain=(hash(gl_FragCoord.xy+uTime)-.5)*uGrain;
        col=clamp(col+grain,0.,1.);
        float vignette=1.-smoothstep(.35,1.18,length(p));
        outColor=vec4(col*(.72+.28*vignette),.9);
      }
    `;
    const hex = value => {
      const c = value.replace('#','');
      return [parseInt(c.slice(0,2),16), parseInt(c.slice(2,4),16), parseInt(c.slice(4,6),16)].map(v => v / 255);
    };
    const uniforms = {
      uResolution: { value: new Float32Array(2) }, uTime: { value: 0 }, uSpeed: { value: reduceMotion ? 0 : timeSpeed },
      uWarp: { value: warpStrength }, uFrequency: { value: warpFrequency }, uWarpSpeed: { value: warpSpeed },
      uRotation: { value: rotationAmount }, uNoiseScale: { value: noiseScale }, uGrain: { value: grainAmount },
      uContrast: { value: contrast }, uSaturation: { value: saturation }, uZoom: { value: zoom },
      uColor1: { value: hex(color1) }, uColor2: { value: hex(color2) }, uColor3: { value: hex(color3) },
    };
    const program = new Program(gl, { vertex, fragment, uniforms });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const resize = () => {
      renderer.setSize(root.clientWidth || 1, root.clientHeight || 1);
      uniforms.uResolution.value[0] = gl.drawingBufferWidth;
      uniforms.uResolution.value[1] = gl.drawingBufferHeight;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root); resize();
    let raf = 0; let visible = true; const startedAt = performance.now();
    const render = now => {
      uniforms.uTime.value = (now - startedAt) * .001;
      renderer.render({ scene: mesh });
      if (!reduceMotion && visible) raf = requestAnimationFrame(render);
    };
    const start = () => { if (!raf && !reduceMotion) raf = requestAnimationFrame(render); else if (reduceMotion) render(performance.now()); };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; };
    const observer = new IntersectionObserver(([entry]) => { visible = !!entry?.isIntersecting; if (visible) start(); else stop(); }, { rootMargin: '180px' });
    observer.observe(root); start();
    const onVisibility = () => { if (document.hidden) stop(); else if (visible) start(); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => { stop(); document.removeEventListener('visibilitychange', onVisibility); observer.disconnect(); resizeObserver.disconnect(); gl.canvas.remove(); };
  }, [timeSpeed, warpStrength, warpFrequency, warpSpeed, rotationAmount, noiseScale, grainAmount, contrast, saturation, zoom, color1, color2, color3]);

  return <div className={`grainient-container ${className}`} ref={rootRef} aria-hidden="true" />;
}

export default Grainient;
