// IntersectionObserver to blend section colors smoothly and parallax blobs
export function initSections(){
  const sections=[...document.querySelectorAll('.section')];
  let targetBg = getComputedStyle(document.documentElement).getPropertyValue('--mauve').trim();

  function getColorToken(name){
    return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  }
  function lerpColor(a,b,t){
    const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16);
    const ar=(pa>>16)&255, ag=(pa>>8)&255, ab=pa&255;
    const br=(pb>>16)&255, bg=(pb>>8)&255, bb=pb&255;
    const r=Math.round(ar+(br-ar)*t);
    const g=Math.round(ag+(bg-ag)*t);
    const b2=Math.round(ab+(bb-ab)*t);
    return `#${((1<<24)+(r<<16)+(g<<8)+b2).toString(16).slice(1)}`;
  }

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const colorKey = e.target.getAttribute('data-color');
      const to = getColorToken(colorKey);
      const from = targetBg;
      const start = performance.now(), dur = 950;
      (function tick(now){
        const t = Math.min(1, (now-start)/dur);
        const ease = t<.5 ? 2*t*t : -1+(4-2*t)*t;
        const mix = lerpColor(from,to,ease);
        document.body.style.background = `linear-gradient(180deg, ${from} 0%, ${mix} 50%, ${to} 100%)`;
        if (t<1) requestAnimationFrame(tick);
        else targetBg = to;
      })(start);
    });
  }, { root: document.getElementById('scroll'), threshold:[0.1,0.5,0.9] });

  sections.forEach(s=>io.observe(s));

  // Parallax scroll effect (very subtle)
  const scroller = document.getElementById('scroll');
  scroller.addEventListener('scroll',()=>{
    const y = scroller.scrollTop;
    document.documentElement.style.setProperty('--parallax', (y*0.02)+'px');
  }, {passive:true});
}
