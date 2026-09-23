import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, ArrowDown, ArrowRight, ChevronLeft, ChevronRight, Mail, Phone, MapPin, Sparkles, Menu, X } from 'lucide-react';
import Prism from './Prism';
import Grainient from './Grainient';
import DotField from './DotField';
import BorderGlow from './BorderGlow';
import './styles.css';
import './hero.css';
import './theme.css';
import './motion.css';
import './Prism.css';
import './portfolio.css';

const media = `${import.meta.env.BASE_URL}media/`;
import { works, workCategories, workMedia, preview } from './portfolio-data';
function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState('全部');
  const [activeWork, setActiveWork] = React.useState(null);
  const [activeImage, setActiveImage] = React.useState(0);
  const visibleWorks = activeCategory === '全部' ? works : works.filter(work => work.category === activeCategory);
  const openWork = work => { setActiveWork(work); setActiveImage(0); };
  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); };

  React.useEffect(() => {
    if (!activeWork) return undefined;
    const onKeyDown = event => {
      if (event.key === 'Escape') setActiveWork(null);
      if (event.key === 'ArrowRight') setActiveImage(index => (index + 1) % activeWork.images.length);
      if (event.key === 'ArrowLeft') setActiveImage(index => (index - 1 + activeWork.images.length) % activeWork.images.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKeyDown); };
  }, [activeWork]);

  React.useLayoutEffect(() => {
    let cancelled = false;
    let ctx;
    const runMotion = async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      ctx = gsap.context(() => {
      const sectionNodes = gsap.utils.toArray('[data-motion-section]');

      if (reduceMotion) {
        gsap.set('.opening-screen', { display: 'none' });
        gsap.set('.hero .nav, .hero .eyebrow, .hero h1 > *, .hero-thesis, .hero-foot, .hero-manifesto, .hero-index', { clearProps: 'all' });
        gsap.set('.section-ghost, .section-kicker, .section-title, .section-note, .portrait-wrap, .about-copy > *, .stats > div, .work-card, .outline-btn, .strength, .email-link, .contact-bottom', { clearProps: 'all' });
        return;
      }

      gsap.set('.hero-media', { scale: 1.08, transformOrigin: 'center center' });
      gsap.set('.opening-screen__mark', { autoAlpha: 0, y: 18 });
      gsap.set('.hero .nav', { autoAlpha: 0, y: -24 });
      gsap.set('.hero .eyebrow, .hero-thesis, .hero-foot, .hero-manifesto, .hero-index', { autoAlpha: 0, y: 28 });
      gsap.set('.hero h1 > *', { autoAlpha: 0, yPercent: 125, scaleX: 1.42, transformOrigin: 'left center' });

      const opening = gsap.timeline({ defaults: { ease: 'power3.out' } });
      opening
        .to('.opening-screen__line', { scaleX: 1, duration: 0.6, ease: 'power4.inOut' })
        .to('.opening-screen__mark', { autoAlpha: 1, y: 0, duration: 0.35 }, '-=0.24')
        .to('.opening-screen', { yPercent: -100, duration: 1.2, ease: 'power4.inOut' }, '+=0.18')
        .to('.hero-media', { scale: 1, duration: 1.5, ease: 'power3.out' }, '<')
        .to('.hero .nav', { autoAlpha: 1, y: 0, duration: 0.68 }, '-=0.72')
        .to('.hero .eyebrow', { autoAlpha: 1, y: 0, duration: 0.52 }, '-=0.38')
        .to('.hero h1 > *', { autoAlpha: 1, yPercent: 0, scaleX: 1, duration: 1.1, stagger: 0.16, ease: 'expo.out' }, '-=0.22')
        .to('.hero-thesis', { autoAlpha: 1, y: 0, duration: 0.62 }, '-=0.56')
        .to('.hero-foot, .hero-manifesto, .hero-index', { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.08 }, '-=0.4');

      sectionNodes.forEach(section => {
        const ghost = section.querySelector('.section-ghost');
        const kicker = section.querySelector('.section-kicker');
        const title = section.querySelector('.section-title');
        const note = section.querySelector('.section-note');
        const cards = section.querySelectorAll('.work-card, .strength');
        const content = section.querySelectorAll('.portrait-wrap, .about-copy > *, .stats > div, .outline-btn, .email-link, .contact-bottom');
        const images = section.querySelectorAll('.work-image');
        const imageItems = section.querySelectorAll('.work-image img, .portrait-wrap img');
        const reveal = gsap.timeline({
          defaults: { ease: 'expo.out' },
          scrollTrigger: { trigger: section, start: 'top 72%', once: true },
        });

        if (ghost) reveal.fromTo(ghost, { autoAlpha: 0, yPercent: 135, scale: 1.35 }, { autoAlpha: 0.16, yPercent: 0, scale: 1, duration: 1.15 }, 0);
        if (kicker) reveal.fromTo(kicker, { autoAlpha: 0, x: -42 }, { autoAlpha: 1, x: 0, duration: 0.66 }, 0.16);
        if (title) reveal.fromTo(title, { autoAlpha: 0, y: 84, skewY: 3 }, { autoAlpha: 1, y: 0, skewY: 0, duration: 0.86 }, 0.24);
        if (note) reveal.fromTo(note, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.62 }, 0.42);
        if (content.length) reveal.fromTo(content, { autoAlpha: 0, y: 74 }, { autoAlpha: 1, y: 0, duration: 0.82, stagger: 0.1 }, 0.5);
        if (cards.length) reveal.fromTo(cards, { autoAlpha: 0, y: 112, rotateX: 7, transformPerspective: 900 }, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.95, stagger: 0.17 }, 0.55);
        if (images.length) reveal.fromTo(images, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.05, stagger: 0.17 }, 0.68);
        imageItems.forEach(image => {
          const trigger = image.closest('.work-image') || image.closest('.portrait-wrap');
          if (!trigger) return;
          gsap.fromTo(image, { scale: 1.14, yPercent: -4 }, {
            scale: 1,
            yPercent: 4,
            ease: 'none',
            scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1.25 },
          });
        });
      });
      });
    };
    runMotion();

    return () => { cancelled = true; ctx?.revert(); };
  }, []);

  return <main>
    <section className="hero" id="top">
      <div className="opening-screen" aria-hidden="true"><span className="opening-screen__mark">HZ / 26</span><span className="opening-screen__line"/></div>
      <div className="hero-media"><Prism animationType="3drotate" timeScale={0.22} glow={1.3} bloom={1.25} hueShift={0.28} colorFrequency={1.1} suspendWhenOffscreen/><div className="hero-image-wash"/><div className="grid-overlay"/></div>
      <nav className="nav container"><BorderGlow as="button" className="brand" onClick={() => scrollTo('top')}><span className="brand-mark">HZ</span><span>洪泽华<span className="brand-dot">.</span></span></BorderGlow><div className={`nav-links ${menuOpen ? 'open' : ''}`}><BorderGlow as="button" onClick={() => scrollTo('work')}>作品 <i>01</i></BorderGlow><BorderGlow as="button" onClick={() => scrollTo('about')}>关于 <i>02</i></BorderGlow><BorderGlow as="button" onClick={() => scrollTo('contact')}>联系 <i>03</i></BorderGlow></div><BorderGlow as="button" className="contact-btn" onClick={() => scrollTo('contact')}>START A PROJECT <ArrowUpRight size={16}/></BorderGlow><BorderGlow as="button" className="menu-btn" aria-label="打开菜单" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</BorderGlow></nav>
      <div className="hero-content container"><p className="eyebrow"><span className="pulse"/>HONGZEHUA / VISUAL DESIGNER</p><h1 aria-label="HONGZEHUA"><span>HONG</span><br/><em>ZEHUA</em></h1><p className="hero-thesis">把抽象的想法<br/>变成可被记住的视觉。</p><div className="hero-foot"><div className="hero-stat"><strong>10<span>+</span></strong><small>VISUAL SYSTEMS<br/>CREATED</small></div><BorderGlow as="button" className="hero-cta" onClick={() => scrollTo('contact')}>START A PROJECT <ArrowUpRight size={17}/></BorderGlow><BorderGlow as="button" className="scroll-cue" onClick={() => scrollTo('about')}>SCROLL TO EXPLORE <ArrowDown size={17}/></BorderGlow></div></div>
      <div className="hero-manifesto"><b>DESIGN</b> IS A WAY<br/>TO BE REMEMBERED<span>.</span></div><div className="hero-index">01 <span>/</span> 04</div>
    </section>

    <section className="about section container" id="about" data-motion-section><Grainient className="about-grainient" timeSpeed={0.16} warpStrength={1.15} warpFrequency={4.5} warpSpeed={1.6} rotationAmount={320} noiseScale={2} grainAmount={0.06} contrast={1.35} saturation={0.95} zoom={0.92} color1="#ff3b24" color2="#171112" color3="#080808"/><div className="section-head"><span className="section-ghost" aria-hidden="true">ABOUT</span><p className="kicker section-kicker">02 / ABOUT</p><h2 className="section-title">关于我</h2><p className="section-note">视觉传达设计专业 · 台州学院<br/>在校实践 / 独立项目 / 持续创作</p></div><div className="about-grid"><div className="portrait-wrap"><img src={`${media}portrait.png`} alt="洪泽华头像"/><div className="portrait-tag">TAIZHOU · CN<br/><span>2004 — PRESENT</span></div></div><div className="about-copy"><p className="lead">我是洪泽华，一名视觉设计师、AI 设计师与品牌设计师。擅长把抽象的想法转译成清晰、有温度、能被记住的视觉系统。</p><p>从品牌识别、包装、海报到产品界面，我关注每一个触点背后的叙事与秩序。相信好的设计不是装饰，而是让人与品牌之间产生连接的方式。</p><div className="contact-lines"><a href="mailto:3041509935@qq.com"><Mail size={16}/>3041509935@qq.com <ArrowUpRight size={14}/></a><a href="tel:19704639509"><Phone size={16}/>197 0463 9509 <ArrowUpRight size={14}/></a><span><MapPin size={16}/>浙江 · 台州</span></div></div></div><div className="stats"><div><strong>10<span>+</span></strong><small>包装与文创项目</small></div><div><strong>20<span>+</span></strong><small>视觉方案与物料</small></div><div><strong>15<span>%</span></strong><small>品牌曝光提升</small></div><div><strong>03</strong><small>年设计实践</small></div></div></section>

    <section className="work section" id="work" data-motion-section><DotField className="section-dotfield"/><div className="container"><div className="section-head work-head"><span className="section-ghost" aria-hidden="true">WORK</span><div><p className="kicker section-kicker">03 / SELECTED WORK</p><h2 className="section-title">精选项目</h2></div><p className="section-note">品牌、数字产品与视觉实验<br/>按项目查看完整创作过程</p></div><div className="work-filters" role="group" aria-label="筛选作品分类">{workCategories.map(category => <BorderGlow as="button" key={category} className={activeCategory === category ? 'active' : ''} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}<span>{category === '全部' ? works.length : works.filter(work => work.category === category).length}</span></BorderGlow>)}</div><div className="work-grid">{visibleWorks.map((w, i) => <article className={`work-card ${w.tone}`} key={w.title}><BorderGlow as="button" className="work-card-open" onClick={() => openWork(w)} aria-label={`查看${w.title}项目详情`}><div className="work-image"><img src={preview(w.images[0], 'cover')} alt={`${w.title}作品封面`} loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async"/><span className="card-number">{String(i + 1).padStart(2, '0')} / {String(w.images.length).padStart(2, '0')}</span><span className="work-open-icon"><ArrowUpRight size={20}/></span></div><div className="work-meta"><div><p>{w.type}</p><h3>{w.title}</h3><span className="work-category">{w.category} · {w.images.length} 张作品图</span></div><time>{w.year}</time></div></BorderGlow></article>)}</div></div></section>

    <section className="strengths section container" data-motion-section><DotField className="section-dotfield"/><div className="section-head"><span className="section-ghost" aria-hidden="true">CAPABILITIES</span><p className="kicker section-kicker">04 / CAPABILITIES</p><h2 className="section-title">我的优势</h2><p className="section-note">从策略到执行<br/>把复杂问题变成清晰表达</p></div><div className="strength-grid"><div className="strength intro"><Sparkles size={22}/><p>DESIGN<br/>WITH<br/><em>INTENT.</em></p></div>{[['01','品牌视觉','从定位、标志到完整识别系统，建立一致且有辨识度的品牌语言。'],['02','包装与物料','用结构、材质与图形让产品在货架与日常场景里被看见。'],['03','AI 创意工作流','将 AI 融入灵感探索、图像生成与迭代，让想象快速成为可验证的方案。'],['04','数字体验','关注界面层级、交互节奏与使用感受，让视觉真正服务于体验。']].map(([num,t,d]) => <div className="strength" key={num}><span>{num}</span><h3>{t}</h3><p>{d}</p><ArrowUpRight size={18}/></div>)}</div></section>

    <section className="contact section" id="contact" data-motion-section><DotField className="section-dotfield"/><div className="contact-glow"/><div className="container contact-inner"><span className="section-ghost" aria-hidden="true">CONTACT</span><p className="kicker section-kicker">05 / GET IN TOUCH</p><h2 className="section-title">有项目想法？<br/><em>我们聊聊。</em></h2><a className="email-link" href="mailto:3041509935@qq.com">3041509935@qq.com <ArrowUpRight size={22}/></a><div className="contact-bottom"><span>视觉设计 / 品牌设计 / AI 创意</span><span>© 2026 HONGZEHUA</span><BorderGlow as="button" onClick={() => scrollTo('top')}>返回顶部 <ArrowUpRight size={14}/></BorderGlow></div></div></section>
    {activeWork && <div className="work-modal" role="dialog" aria-modal="true" aria-label={`${activeWork.title}项目详情`} onMouseDown={event => { if (event.target === event.currentTarget) setActiveWork(null); }}><div className="work-modal__panel"><header className="work-modal__header"><div><span>{activeWork.type}</span><h2>{activeWork.title}</h2></div><BorderGlow as="button" className="work-modal__close" onClick={() => setActiveWork(null)} aria-label="关闭项目详情"><X size={22}/></BorderGlow></header><div className="work-modal__body"><div className="work-modal__stage"><img src={preview(activeWork.images[activeImage], 'detail')} alt={`${activeWork.title}作品 ${activeImage + 1}`}/><BorderGlow as="button" className="work-modal__prev" aria-label="上一张" onClick={() => setActiveImage(index => (index - 1 + activeWork.images.length) % activeWork.images.length)}><ChevronLeft size={22}/></BorderGlow><BorderGlow as="button" className="work-modal__next" aria-label="下一张" onClick={() => setActiveImage(index => (index + 1) % activeWork.images.length)}><ChevronRight size={22}/></BorderGlow><span className="work-modal__counter">{String(activeImage + 1).padStart(2, '0')} / {String(activeWork.images.length).padStart(2, '0')}</span></div><aside className="work-modal__info"><p>{activeWork.description}</p><dl><div><dt>分类</dt><dd>{activeWork.category}</dd></div><div><dt>年份</dt><dd>{activeWork.year}</dd></div><div><dt>作品数量</dt><dd>{activeWork.images.length} 张</dd></div></dl><div className="work-modal__thumbs">{activeWork.images.map((image, index) => <BorderGlow as="button" key={image} className={activeImage === index ? 'active' : ''} onClick={() => setActiveImage(index)} aria-label={`查看第 ${index + 1} 张作品`}><img src={preview(image, 'thumb')} alt="" loading="lazy"/></BorderGlow>)}</div></aside></div></div></div>}
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
