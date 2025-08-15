const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

startBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 1024;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = document.getElementById('waveform');
    const ctx = canvas.getContext('2d');

    const noiseLevelText = document.getElementById('noiseLevel');
    const spikeCountText = document.getElementById('spikeCount');

    let spikeCount = parseInt(localStorage.getItem("spikeCount") || "0");
    spikeCountText.textContent = spikeCount;

    const SPIKE_THRESHOLD = 35;

    function update() {
      analyser.getByteTimeDomainData(dataArray);

      // Draw waveform with pastel line
      ctx.fillStyle = "#CAFFBF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#9BF6FF";
      ctx.beginPath();

      let sum = 0;
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        ctx.lineTo(x, y);
        x += sliceWidth;

        const val = (dataArray[i] - 128) / 128;
        sum += val * val;
      }
      ctx.stroke();

      const rms = Math.sqrt(sum / bufferLength);
      const level = Math.min(100, Math.round(rms * 200));
      noiseLevelText.textContent = `${level}%`;

      if (level > SPIKE_THRESHOLD) {
        spikeCount++;
        spikeCountText.textContent = spikeCount;
        localStorage.setItem("spikeCount", spikeCount);
      }

      requestAnimationFrame(update);
    }
    update();
  } catch (err) {
    alert('Microphone access denied or unavailable.');
    console.error(err);
  }
});

resetBtn.addEventListener('click', () => {
  localStorage.setItem("spikeCount", "0");
  document.getElementById('spikeCount').textContent = "0";
});
