import { AudioEngine } from './audioEngine.js';
import { Visualizer } from './visualizer.js';
import { Local } from './storage.js';
import { setMicStatus, setLevelBar, setReadouts, setMoodBackground } from './ui.js';
import { initSections } from './sections.js';

// Initialize section transitions/parallax
initSections();

// DOM elements
const btnStart = document.getElementById('btnStart');
const btnStop  = document.getElementById('btnStop');
const waveCanvas = document.getElementById('waveCanvas');
const viz = new Visualizer(waveCanvas);

// Spike tracking for per-minute rate
let spikesCount = 0;
let lastMinute = Math.floor(Date.now()/60000);

function calcDistractionScore(level, spikesPerMin){
  const base = level * 60;                    // up to 60 from level
  const spikesWeight = Math.min(40, spikesPerMin * 5); // up to 40
  return Math.round(base + spikesWeight);
}

const engine = new AudioEngine({
  onRMS: ({ rms, smooth }) => {
    const pct = Math.round(smooth * 100);
    setLevelBar(pct);
    viz.drawWave(smooth);
    setMoodBackground(smooth);

    const nowMin = Math.floor(Date.now()/60000);
    if (nowMin !== lastMinute){
      spikesCount = 0;
      lastMinute = nowMin;
    }
    const score = calcDistractionScore(smooth, spikesCount);
    setReadouts({ rmsPct:pct, score, spikesPerMin: spikesCount });

    Local.setRuntimeStats({ lastRMS:pct, lastScore:score, lastSpikesPerMin:spikesCount, ts:Date.now() });
  },
  onSpike: (evt) => {
    spikesCount += 1;
    const chip = document.getElementById('permStatus');
    chip.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}], {duration:260,easing:'ease-out'});
  },
  onError: (e) => {
    setMicStatus('Mic: permission needed or unavailable', '--melon');
    console.error(e);
    alert('Microphone permission denied or unavailable. Enable mic access in your browser settings.');
  }
});

// Controls
btnStart.addEventListener('click', async ()=>{
  setMicStatus('Mic: requesting…', '--elec');
  try { await engine.ctx?.resume(); } catch {}
  const ok = await engine.start();
  if (ok){
    setMicStatus('Mic: listening', '--tea');
    btnStart.disabled = true;
    btnStop.disabled = false;
    Local.setConsent(true);
  } else {
    setMicStatus('Mic: blocked', '--melon');
  }
});

btnStop.addEventListener('click', ()=>{
  engine.stop();
  setMicStatus('Mic: stopped', '--sunset');
  btnStart.disabled = false;
  btnStop.disabled = true;
});

// Music suggestions based on score
const musicList = document.getElementById('musicList');
function updateMusic(score){
  let set = [];
  if (score < 30){
    set = [
      {title:'Soft White Noise', url:'https://www.youtube.com/results?search_query=soft+white+noise+1hr'},
      {title:'Calm Rain', url:'https://www.youtube.com/results?search_query=calm+rain+ambience+focus'},
      {title:'Lo-fi Beats', url:'https://www.youtube.com/results?search_query=lofi+beats+to+study+to'}
    ];
  } else if (score < 60){
    set = [
      {title:'Brown Noise', url:'https://www.youtube.com/results?search_query=brown+noise+focus'},
      {title:'Ocean Waves', url:'https://www.youtube.com/results?search_query=ocean+waves+white+noise'},
      {title:'Focus Piano', url:'https://www.youtube.com/results?search_query=focus+piano+playlist'}
    ];
  } else {
    set = [
      {title:'Pink Noise', url:'https://www.youtube.com/results?search_query=pink+noise+masking'},
      {title:'Forest Storm', url:'https://www.youtube.com/results?search_query=forest+storm+ambience'},
      {title:'Deep Focus Mix', url:'https://www.youtube.com/results?search_query=deep+focus+music+mix'}
    ];
  }
  musicList.innerHTML = set.map(x=>`
    <div class="music-card">
      <h3>${x.title}</h3>
      <a target="_blank" rel="noopener">Open</a>
    </div>
  `).join('');
  [...musicList.querySelectorAll('.music-card a')].forEach((a,i)=>{ a.href = set[i].url; });
}

// Update music every 2s from runtime stats
setInterval(()=>{
  const s = Local.getRuntimeStats();
  if (s?.lastScore != null) updateMusic(s.lastScore);
}, 2000);

// Initial calm background
setMoodBackground(0.1);
