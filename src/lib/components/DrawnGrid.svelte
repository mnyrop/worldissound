<script>
	import { onMount } from 'svelte';

	let { items = [], onSelect = () => {}, playingBySrc = {}, activeAudio = null } = $props();

	const drawerAspectRatio = 1482 / 902;
	const rowTopClearancePx = 14;
	const rowBottomClearancePx = 14;
	const rowStepDebounceMs = 180;

	let containerEl = $state();
	let columns = $state(2);
	let rowsPerView = $state(3);
	let viewportHeight = $state(0);
	let rowGapPx = $state(16);
	let rowStart = $state(0);
	let layoutRafId = 0;
	let lastStepAt = 0;

	const rows = $derived(chunkItems(items, columns));
	const maxRowStart = $derived(Math.max(0, rows.length - rowsPerView));
	const visibleRows = $derived(rows.slice(rowStart, rowStart + rowsPerView));

	function chunkItems(sourceItems, chunkSize) {
		const chunks = [];
		for (let index = 0; index < sourceItems.length; index += chunkSize) {
			chunks.push(sourceItems.slice(index, index + chunkSize));
		}
		return chunks;
	}

	function firstWord(label) {
		if (!label) return '';
		return label.trim().split(/\s+/)[0] ?? '';
	}

	function clampRowStart(nextStart) {
		return Math.max(0, Math.min(nextStart, maxRowStart));
	}

	function stepRows(step) {
		if (step === 0) return;
		rowStart = clampRowStart(rowStart + step);
	}

	function handleWheel(event) {
		event.preventDefault();

		if (Math.abs(event.deltaY) < 4) return;

		const now = performance.now();
		if (now - lastStepAt < rowStepDebounceMs) return;
		lastStepAt = now;

		stepRows(event.deltaY > 0 ? 1 : -1);
	}

	function handleKeydown(event) {
		if (event.key === 'ArrowDown' || event.key === 'PageDown') {
			event.preventDefault();
			stepRows(1);
			return;
		}

		if (event.key === 'ArrowUp' || event.key === 'PageUp') {
			event.preventDefault();
			stepRows(-1);
			return;
		}

		if (event.key === 'Home') {
			event.preventDefault();
			rowStart = 0;
			return;
		}

		if (event.key === 'End') {
			event.preventDefault();
			rowStart = maxRowStart;
		}
	}

	function updateLayoutMetrics() {
		if (!containerEl) return;

		columns = window.innerWidth >= 640 ? 3 : 2;
		const targetRows = window.innerWidth >= 640 ? 4 : 3;
		rowGapPx = window.innerWidth >= 768 ? 24 : 16;

		const cardWidth = (containerEl.clientWidth - rowGapPx * (columns - 1)) / columns;
		const cardHeight = cardWidth / drawerAspectRatio;
		const availableHeight = Math.max(
			0,
			containerEl.clientHeight - rowTopClearancePx - rowBottomClearancePx
		);
		const fitRows = Math.max(
			1,
			Math.min(targetRows, Math.floor((availableHeight + rowGapPx) / (cardHeight + rowGapPx)))
		);

		rowsPerView = fitRows;
		viewportHeight =
			rowTopClearancePx + cardHeight * fitRows + rowGapPx * (fitRows - 1) + rowBottomClearancePx;
	}

	function scheduleLayoutMetricsUpdate() {
		cancelAnimationFrame(layoutRafId);
		layoutRafId = requestAnimationFrame(() => {
			updateLayoutMetrics();
			layoutRafId = requestAnimationFrame(() => {
				updateLayoutMetrics();
			});
		});
	}

	$effect(() => {
		items.length;
		scheduleLayoutMetricsUpdate();
	});

	$effect(() => {
		maxRowStart;
		rowStart = clampRowStart(rowStart);
	});

	onMount(() => {
		scheduleLayoutMetricsUpdate();

		const observer = new ResizeObserver(() => {
			scheduleLayoutMetricsUpdate();
		});

		if (containerEl) {
			observer.observe(containerEl);
		}

		window.addEventListener('resize', scheduleLayoutMetricsUpdate);
		window.addEventListener('keydown', handleKeydown);

		return () => {
			observer.disconnect();
			window.removeEventListener('resize', scheduleLayoutMetricsUpdate);
			window.removeEventListener('keydown', handleKeydown);
			cancelAnimationFrame(layoutRafId);
		};
	});
</script>

<div style="position: absolute; inset: 0;">
	<div
		bind:this={containerEl}
		class="pointer-events-auto absolute top-[38%] left-[39%] box-border w-[22%] rounded-md outline-none sm:left-[36%] sm:w-[28%] md:left-[34%] md:w-[32%]"
		style="bottom: 6%;"
		onwheel={handleWheel}
	>
		<div
			class="box-border flex flex-col gap-4 overflow-visible md:gap-6"
			style={`height: ${viewportHeight}px; max-height: 100%; padding-top: ${rowTopClearancePx}px; padding-bottom: ${rowBottomClearancePx}px;`}
		>
			{#each visibleRows as row, rowIndex (`row-${rowStart + rowIndex}`)}
				{@const rowZBase = (rowIndex + 1) * 10}
				<div class="drawer-row relative block w-full">
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
						{#each row as item}
							{@const isPlaying = Boolean(playingBySrc[item.audio])}
							{@const isOpen = activeAudio === item.audio || isPlaying}
							{@const labelWord = firstWord(item.label) || '—'}
							<div class="group relative w-full" style="aspect-ratio: 1482 / 902;">
								<div
									aria-hidden="true"
									class="pointer-events-none absolute top-0 right-0 bottom-2.5 left-0 rounded-md bg-gray-500"
								></div>
								<div
									aria-hidden="true"
									style={`z-index: ${rowZBase + 1};`}
									class={`paper-layer pointer-events-none absolute top-2 right-2 left-2 h-1/2 rounded-sm border bg-white transition-transform duration-600 ease-in-out ${
										!isPlaying ? 'group-hover:-translate-y-5.5' : ''
									} ${isOpen && !isPlaying ? '-translate-y-5.5' : ''} ${
										isPlaying ? 'paper-playing' : ''
									}`}
								></div>
								<button
									type="button"
									style={`z-index: ${rowZBase + 2}; height: 100%; width: 100%; background-image: url('/drawer.png'); background-size: cover; background-position: center;`}
									class={`relative cursor-pointer rounded-md transition-[background-color,transform] duration-600 ease-in-out hover:translate-y-2.5 ${
										isOpen ? 'translate-y-2.5' : ''
									} ${isPlaying ? 'bg-blue-200' : 'bg-gray-200'}`}
									aria-label={item.label}
									onclick={() => {
										onSelect(item);
									}}
								>
									<span
										aria-hidden="true"
										style="position: absolute; top: 16px; left: 50%; transform: translateX(-50%); z-index: 9999;"
										class="pointer-events-none roundedpx-2 py-1 text-center text-xs leading-none tracking-wide whitespace-nowrap text-black font-mono font-extralight"
									>
										{labelWord}
									</span>
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.paper-layer {
		transform-origin: left bottom;
	}

	.paper-playing {
		transform: translateY(-1.45rem) rotate(4deg);
	}

	.group:hover .paper-playing {
		transform: translateY(-1.375rem) rotate(0deg);
	}
</style>
