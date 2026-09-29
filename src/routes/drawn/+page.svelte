<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  // Core view state.
  let zoomLevel = $state(1);
  let panX = $state(0);
  let panY = $state(0);
  let viewportEl = $state();
  let viewportWidth = $state(0);
  let viewportHeight = $state(0);
  let imageNaturalWidth = $state(1);
  let imageNaturalHeight = $state(1);

  // Drag session state used while panning.
  let isDragging = $state(false);
  let dragStartX = $state(0);
  let dragStartY = $state(0);
  let dragStartPanX = $state(0);
  let dragStartPanY = $state(0);

  // Overlay coordinates in percentages of the source image.
  // Edit these values manually later: x/y are top-left, w/h are size.
  const overlayContainer = { 
    id: 'box-1', x: 40, y: 30, w: 25, h: 35 
  };

  const coverScale = $derived(
    viewportWidth > 0 && viewportHeight > 0
      ? Math.max(viewportWidth / imageNaturalWidth, viewportHeight / imageNaturalHeight)
      : 1
  );
  const stageWidth = $derived(imageNaturalWidth * coverScale);
  const stageHeight = $derived(imageNaturalHeight * coverScale);
  const stageLeft = $derived((viewportWidth - stageWidth) / 2);
  const stageTop = $derived((viewportHeight - stageHeight) / 2);

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function measureViewport() {
    if (!viewportEl) return;
    const rect = viewportEl.getBoundingClientRect();
    viewportWidth = rect.width;
    viewportHeight = rect.height;
  }

  function handleImageLoad(event) {
    imageNaturalWidth = event.currentTarget.naturalWidth || 1;
    imageNaturalHeight = event.currentTarget.naturalHeight || 1;
  }

  function handleWheel(event) {
    event.preventDefault();

    const rect = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - (rect.left + rect.width / 2);
    const pointerY = event.clientY - (rect.top + rect.height / 2);

    // Tunable zoom controls:
    // - delta clamp (-60..60) limits sudden wheel spikes
    // - sensitivity (0.0015) controls how fast zoom responds
    const clampedDelta = clamp(event.deltaY, -60, 60);
    const zoomFactor = Math.exp(-clampedDelta * 0.0015);

    // Tunable zoom range: min 1x, max 4x.
    const nextZoom = clamp(Number((zoomLevel * zoomFactor).toFixed(3)), 1, 4);

    if (nextZoom === zoomLevel) return;

    // Keep the point under the cursor visually anchored while zooming.
    const ratio = nextZoom / zoomLevel;
    panX = pointerX - (pointerX - panX) * ratio;
    panY = pointerY - (pointerY - panY) * ratio;
    zoomLevel = nextZoom;

    if (zoomLevel === 1) {
      panX = 0;
      panY = 0;
    }
  }

  function handlePointerDown(event) {
    // Pan only matters once the image is zoomed in.
    if (zoomLevel <= 1) return;
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartPanX = panX;
    dragStartPanY = panY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!isDragging) return;
    panX = dragStartPanX + (event.clientX - dragStartX);
    panY = dragStartPanY + (event.clientY - dragStartY);
  }

  function handlePointerUp(event) {
    if (!isDragging) return;
    isDragging = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleKeydown(event) {
    // Space returns to the default full-view position.
    if (event.code === 'Space') {
      event.preventDefault();
      zoomLevel = 1;
      panX = 0;
      panY = 0;
    }
  }

  onMount(() => {
    measureViewport();

    const observer = new ResizeObserver(() => {
      measureViewport();
    });

    if (viewportEl) {
      observer.observe(viewportEl);
    }

    return () => {
      observer.disconnect();
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<div bind:this={viewportEl} style="width: 100vw; height: 100vh; overflow: hidden;">
  <button
    type="button"
    aria-label="Zoom and pan image"
    onwheel={handleWheel}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
    style={`position: relative; width: 100%; height: 100%; padding: 0; border: 0; background: transparent; overflow: hidden; touch-action: none; cursor: ${zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'};`}
  >
    <div
      style={`position: absolute; left: ${stageLeft}px; top: ${stageTop}px; width: ${stageWidth}px; height: ${stageHeight}px; transition: transform 0.14s ease-out; transform-origin: center center; transform: translate(${panX}px, ${panY}px) scale(${zoomLevel});`}
    >
      <img
        src={`${base}/draft.jpeg`}
        alt="Draft"
        draggable="false"
        onload={handleImageLoad}
        style="display: block; width: 100%; height: 100%; user-select: none;"
      />

      <div style="position: absolute; inset: 0; pointer-events: none;">
        <div
          style={`position: absolute; left: ${overlayContainer.x}%; top: ${overlayContainer.y}%; width: ${overlayContainer.w}%; height: ${overlayContainer.h}%; box-sizing: border-box; border: 2px solid rgba(239, 68, 68, 0.85); background: rgba(239, 68, 68, 0.14); border-radius: 2px;`}
        ></div>
      </div>
    </div>
  </button>
</div>