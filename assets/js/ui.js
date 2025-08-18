export function setMicStatus(text, colorVar){
  const chip = document.getElementById('permStatus');
  chip.textContent = text;
  chip.style.background = 'var(--powder)';
  chip.style.borderColor = 'rgba(0,0,0,.08)';
  chip.style.color = '#111';
  if (colorVar) chip.style.boxShadow = `0 0 0 3px ${getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim()}33`;
}

export function setLevelBar(pct){
  const bar = document.getElementById('levelBar');
  bar.style.width = `${Math.round(pct)}%`;
  if (pct < 25) bar.style.background = 'linear-gradient(90deg, var(--tea), var(--peri))';
  else if (pct < 55) bar.style.background = 'linear-gradient(90deg, var(--elec), var(--mauve))';
  else bar.style.background = 'linear-gradient(90deg, var(--sunset), var(--melon))';
}

export function setReadouts({rmsPct, score, spikesPerMin}){
  document.getElementById('rmsText').textContent = `RMS: ${rmsPct}%`;
  document.getElementById('scoreText').textContent = `Distraction Score: ${score}`;
  document.getElementById('spikesText').textContent = `Spikes/min: ${spikesPerMin}`;
}

export function setMoodBackground(level){
  const mix = (a,b,t)=>{
    const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16);
    const ar=(pa>>16)&255, ag=(pa>>8)&255, ab=pa&255;
    const br=(pb>>16)&255, bg=(pb>>8)&255, bb=pb&255;
    const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), bl=Math.round(ab+(bb-ab)*t);
    return `#${((1<<24)+(r<<16)+(g<<8)+bl).toString(16).slice(1)}`;
  };
  const calmA = '#caffbf', calmB = '#bdb2ff';
  const hotA  = '#ffd6a5', hotB  = '#ffadad';
  const t = Math.min(1, Math.max(0, level));
  const a = mix(calmA, hotA, t);
  const b = mix(calmB, hotB, t);
  document.body.style.background = `linear-gradient(180deg, ${a}, ${b})`;
}
