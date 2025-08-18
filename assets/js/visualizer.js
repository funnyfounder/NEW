export class Visualizer {
  constructor(canvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = canvas.width;
    this.h = canvas.height;
    this.gradient = null;
    this._resizeObserver = new ResizeObserver(()=>this._resize());
    this._resizeObserver.observe(canvas);
    this.lastLevel = 0;
  }

  _resize(){
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(rect.width * dpr);
    this.canvas.height = Math.floor(rect.height * dpr);
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this._makeGradient();
  }

  _makeGradient(){
    const ctx = this.ctx;
    const g = ctx.createLinearGradient(0,0,this.w,0);
    g.addColorStop(0, '#9bf6ff'); // Electric Blue
    g.addColorStop(1, '#ffc6ff'); // Mauve
    this.gradient = g;
  }

  drawWave(level){
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    this.lastLevel = this.lastLevel + (level - this.lastLevel) * 0.15;
    const amp = Math.max(6, 90 * this.lastLevel);

    ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    ctx.save();
    ctx.translate(0, h/2);

    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.gradient;
    ctx.lineWidth = 2;

    const waves = 3;
    for (let i=0;i<waves;i++){
      ctx.beginPath();
      const phase = performance.now()/1000 * (0.6 + i*0.1);
      for (let x=0; x<w; x++){
        const t = (x / w) * Math.PI * 2 * (1.2 + i*0.4);
        const y = Math.sin(t + phase) * (amp * (1 - i*0.25));
        if (x===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
      }
      ctx.globalAlpha = 0.7 - i*0.18;
      ctx.stroke();
    }

    ctx.restore();
  }
}
