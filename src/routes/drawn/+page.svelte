<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';

  // Core view state.
  let viewportEl = $state();
  let viewportWidth = $state(0);
  let viewportHeight = $state(0);
  let imageNaturalWidth = $state(1);
  let imageNaturalHeight = $state(1);

  // Overlay coordinates in percentages of the source image.
  // Edit these values manually later: x/y are top-left, w/h are size.
  const overlayContainer = { 
    id: 'box-1', x: 40, y: 40, w: 20, h: 40 
  };
  const overlayCells = Array.from({ length: 12 }, (_, index) => index + 1);

  const coverScale = $derived(
    viewportWidth > 0 && viewportHeight > 0
      ? Math.max(viewportWidth / imageNaturalWidth, viewportHeight / imageNaturalHeight)
      : 1
  );
  const stageWidth = $derived(imageNaturalWidth * coverScale);
  const stageHeight = $derived(imageNaturalHeight * coverScale);
  const stageLeft = $derived((viewportWidth - stageWidth) / 2);
  const stageTop = $derived((viewportHeight - stageHeight) / 2);

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

<div bind:this={viewportEl} style="width: 100vw; height: 100vh; overflow: hidden;">
  <div style="position: relative; width: 100%; height: 100%; overflow: hidden;">
    <div
      style={`position: absolute; left: ${stageLeft}px; top: ${stageTop}px; width: ${stageWidth}px; height: ${stageHeight}px;`}
    >
      <img
        src={`${base}/draft.jpeg`}
        alt="Draft"
        draggable="false"
        onload={handleImageLoad}
        style="display: block; width: 100%; height: 100%; user-select: none;"
      />

      <div style="position: absolute; inset: 0;">
        <div
          class="pointer-events-auto rounded-md grid grid-cols-3 grid-rows-4 overflow-hidden gap-6"
          style={`position: absolute; left: ${overlayContainer.x}%; top: ${overlayContainer.y}%; width: ${overlayContainer.w}%; height: ${overlayContainer.h}%; box-sizing: border-box;`}
        >
          {#each overlayCells as cell}
            <div
              class="cursor-pointer rounded-md bg-orange-200 transition-[background-color] duration-150 ease-out hover:bg-orange-300"
              aria-label={`Grid cell ${cell}`}
            ></div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>