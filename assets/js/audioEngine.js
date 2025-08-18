export class AudioEngine {
  constructor({onRMS,onSpike,onError}) {
    this.onRMS = onRMS;
    this.onSpike = onSpike;
    this.onError = onError;

    this.ctx = null;
    this.stream = null;
    this.source = null;
    this.analyser = null;

    this.fftSize = 2048;
    this.buf = new Float32Array(this.fftSize);

    this.rmsEMA = 0;
    this.alpha = 0.2; // EMA
    this.window = [];
    this.windowSize = 120; // ~2s at 60fps
    this.spikeThresholdK = 3.0;
    this.lastSpikeTs = 0;
    this.refractoryMs = 800;

    this.running = false;
    this._raf = 0;
  }

  async start() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)({latencyHint:'interactive'});
      } else if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation:false, noiseSuppression:false, autoGainControl:false }
      });
      this.source = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.source.connect(this.analyser);

      this.running = true;
      this._loop();
      return true;
    } catch (e) {
      this.onError?.(e);
      return false;
    }
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this._raf);
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  _loop = () => {
    if (!this.running) return;
    this.analyser.getFloatTimeDomainData(this.buf);
    const rms = this._computeRMS(this.buf);
    this.rmsEMA = this.rmsEMA === 0 ? rms : (this.alpha*rms + (1-this.alpha)*this.rmsEMA);

    this.window.push(rms);
    if (this.window.length > this.windowSize) this.window.shift();

    const {mean, std} = this._meanStd(this.window);
    const threshold = mean + this.spikeThresholdK*std;
    const now = performance.now();
    if (rms > threshold && (now - this.lastSpikeTs) > this.refractoryMs) {
      this.lastSpikeTs = now;
      this.onSpike?.({ rms, mean, std, ts: Date.now() });
    }

    this.onRMS?.({ rms, smooth: this.rmsEMA, mean, std });
    this._raf = requestAnimationFrame(this._loop);
  }

  _computeRMS(buf){
    let sum=0;
    for (let i=0;i<buf.length;i++){ const v=buf[i]; sum+=v*v; }
    const v = Math.sqrt(sum / buf.length);
    return Math.min(1, v * 3.5); // normalize/soft-clip for UI
  }

  _meanStd(arr){
    if (!arr.length) return {mean:0,std:0};
    const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
    const variance = arr.reduce((a,b)=>a+(b-mean)**2,0)/arr.length;
    return {mean, std: Math.sqrt(variance)};
  }
}
