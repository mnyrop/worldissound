<script>
  let { src = '', label = 'Audio track' } = $props();

  let audio;
  let analyser;
  let analyserReady = $state(false);
  let dataArray = $state(new Uint8Array(12));
  let animationFrame;
  let isPlaying = $state(false);
  let volume = $state(0.8);

  function setupAnalyser() {
    if (!audio || typeof window === 'undefined') return;

    const url = audio.src || '';
    if (!url || url.startsWith('file:')) {
      analyserReady = false;
      return;
    }

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const sourceNode = audioContext.createMediaElementSource(audio);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);

      const tick = () => {
        if (!analyser || !audio || audio.paused) {
          return;
        }

        const freqData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(freqData);
        dataArray = new Uint8Array(freqData.slice(0, 12));
        animationFrame = requestAnimationFrame(tick);
      };

      analyserReady = true;
      animationFrame = requestAnimationFrame(tick);
    } catch (error) {
      analyserReady = false;
      analyser = null;
    }
  }

  function togglePlayback() {
    if (!audio) return;

    if (audio.paused) {
      audio.play().catch(() => {
        isPlaying = false;
      });
    } else {
      audio.pause();
    }
  }

  $effect(() => {
    if (audio) {
      audio.volume = volume;
    }
  });

  $effect(() => {
    if (audio && !analyser && !analyserReady && isPlaying) {
      setupAnalyser();
    }
  });

  $effect(() => {
    if (!isPlaying && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  });
</script>

<div class="audio-player" role="group" aria-label="{label} player">
  <audio
    bind:this={audio}
    src={src}
    preload="auto"
    crossorigin="anonymous"
    aria-label={label}
    onplay={() => (isPlaying = true)}
    onpause={() => (isPlaying = false)}
    onended={() => (isPlaying = false)}
  ></audio>

  <button
    type="button"
    class="play-toggle"
    aria-label={isPlaying ? `Pause ${label}` : `Play ${label}`}
    aria-pressed={isPlaying}
    onclick={togglePlayback}
  >
    <span class="sr-only">{isPlaying ? 'Pause' : 'Play'} {label}</span>
    {#if isPlaying}
      <span class="pause-icon" aria-hidden="true">
        <span></span>
        <span></span>
      </span>
    {:else}
      <span class="play-icon" aria-hidden="true"></span>
    {/if}
  </button>

  <label class="volume-control">
    <span class="sr-only">Volume for {label}</span>
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      bind:value={volume}
      aria-label={`Volume for ${label}`}
    />
  </label>

  {#if isPlaying && analyserReady}
    <div class="equalizer" aria-hidden="true">
      {#each Array.from({ length: 12 }) as _, index}
        <span style={`height: ${Math.max(0.2, (dataArray[index] ?? 0) / 255 * 1.2)}rem`}></span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .audio-player {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 999px;
    padding: 0.45rem 0.7rem 0.45rem 0.5rem;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
    position: relative;
    flex-wrap: wrap;
  }

  .play-toggle {
    width: 2.8rem;
    height: 2.8rem;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 50%;
    background: #f8fafc;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .play-toggle:focus-visible,
  .volume-control input:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.45);
    outline-offset: 2px;
  }

  .play-icon {
    width: 0;
    height: 0;
    border-top: 0.5rem solid transparent;
    border-bottom: 0.5rem solid transparent;
    border-left: 0.8rem solid #111827;
    margin-left: 0.15rem;
    display: block;
  }

  .pause-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.18rem;
  }

  .pause-icon span {
    display: block;
    width: 0.22rem;
    height: 0.9rem;
    border-radius: 999px;
    background: #111827;
  }

  .volume-control {
    display: flex;
    align-items: center;
    width: 100%;
    flex: 1;
  }

  .volume-control input[type='range'] {
    width: 100%;
    accent-color: #111827;
    cursor: pointer;
  }

  .equalizer {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 0.18rem;
    width: 3.2rem;
    height: 1rem;
    margin-left: auto;
    margin-right: 0.1rem;
    overflow: hidden;
  }

  .equalizer span {
    display: block;
    width: 0.18rem;
    min-height: 0.2rem;
    border-radius: 999px;
    background: #111827;
    transition: height 0.08s linear;
    opacity: 0.9;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
