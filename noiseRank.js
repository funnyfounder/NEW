document.getElementById('startBtn').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 512;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const noiseLevelText = document.getElementById('noiseLevel');
    const meterFill = document.getElementById('meterFill');

    function update() {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128; // Normalize between -1 and 1
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const level = Math.min(100, Math.round(rms * 200)); // Scale to %
      
      noiseLevelText.textContent = `Noise Level: ${level}%`;
      meterFill.style.width = level + "%";

      requestAnimationFrame(update);
    }
    update();
  } catch (err) {
    alert('Microphone access denied or unavailable.');
    console.error(err);
  }
});
