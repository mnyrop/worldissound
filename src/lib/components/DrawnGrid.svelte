<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

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

	function abbreviateTitle(label, maxLength = 14) {
		if (!label) return '';
		const normalized = label.trim();
		if (normalized.length <= maxLength) return normalized;
		return `${normalized.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
	}

	function numberToWord(value) {
		const ones = [
			'zero',
			'one',
			'two',
			'three',
			'four',
			'five',
			'six',
			'seven',
			'eight',
			'nine',
			'ten',
			'eleven',
			'twelve',
			'thirteen',
			'fourteen',
			'fifteen',
			'sixteen',
			'seventeen',
			'eighteen',
			'nineteen'
		];
		const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
		const safeValue = Number.isFinite(value) ? Math.floor(value) : 0;

		if (safeValue < 20) return ones[safeValue] ?? String(safeValue);
		if (safeValue < 100) {
			const tenValue = Math.floor(safeValue / 10);
			const remainder = safeValue % 10;
			return remainder === 0 ? tens[tenValue] : `${tens[tenValue]}-${ones[remainder]}`;
		}

		return String(safeValue);
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
<!-- Container for the drawn grid -->
	<div
		bind:this={containerEl}
		class="pointer-events-auto absolute top-[38%] left-[39%] box-border w-[22%] rounded-md outline-none sm:left-[36%] sm:w-[28%] md:left-[34%] md:w-[32%]"
		style="bottom: 6%;"
		onwheel={handleWheel}
	>
		<!-- Grid wrapper -->
		<div
			class="box-border flex flex-col gap-4 overflow-visible md:gap-6"
			style={`height: ${viewportHeight}px; max-height: 100%; padding-top: ${rowTopClearancePx}px; padding-bottom: ${rowBottomClearancePx}px;`}
		>
			{#each visibleRows as row, rowIndex (`row-${rowStart + rowIndex}`)}
				{@const rowZBase = (rowIndex + 1) * 10}
				<!-- Individual row -->
				<div class="drawer-row relative block w-full">
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
						{#each row as item, columnIndex}
							<!-- Individual item -->
							{@const isPlaying = Boolean(playingBySrc[item.audio])}
							{@const isOpen = activeAudio === item.audio || isPlaying}
							{@const drawerNumber = (rowStart + rowIndex) * columns + columnIndex + 1}
							{@const onewordLabel = item.oneword?.trim?.() ?? ''}
							{@const labelWord = onewordLabel || numberToWord(drawerNumber)}
							{@const paperTitle = isPlaying ? abbreviateTitle(item.label) : '??????'}
							<div class="group relative w-full" style="aspect-ratio: 1482 / 902;">
								<!--Sound playing indicator -->
								{#if isPlaying}
									<div
										aria-hidden="true"
										style={`z-index: ${rowZBase + 2};`}
										class="reverb-layer pointer-events-none absolute top-0 right-0 left-0 h-0"
									>
										<span class="reverb-wave reverb-wave-1"></span>
										<span class="reverb-wave reverb-wave-2"></span>
										<span class="reverb-wave reverb-wave-3"></span>
									</div>
								{/if}
								<!-- Gray inner drawer -->
								<div
									aria-hidden="true"
									class="pointer-events-none absolute top-0 right-0 bottom-2.5 left-0 rounded-md bg-gray-500"
								></div>
								<!-- Paper layer -->
								<div
									aria-hidden="true"
									style={`z-index: ${rowZBase + 1};`}
									class={`paper-layer pointer-events-none absolute -top-1 right-0 left-0 mx-auto w-[90%] aspect-[362/218] rounded-sm transition-transform duration-600 ease-in-out ${
										!isPlaying ? 'group-hover:-translate-y-5.5' : ''
									} ${isOpen && !isPlaying ? '-translate-y-5.5' : ''} ${
										isPlaying ? 'paper-playing' : ''
									}`}
								>
									<div class="relative h-full w-full overflow-hidden rounded-sm bg-[#f3e6cf]">
										<div
											class="absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_11%,rgba(239,68,68,0.35)_11%,rgba(239,68,68,0.35)_11.7%,transparent_11.7%),repeating-linear-gradient(180deg,transparent_0,transparent_27px,rgba(59,130,246,0.25)_28px)]"
										></div>
										<div class="relative ml-[12%] flex h-full w-[84%] px-[4%] pt-[7%]">
											<span class="block max-w-[80%] truncate font-mono text-[10px] font-bold tracking-wide text-stone-900">
												{paperTitle}
											</span>
										</div>
									</div>
								</div>
								<!-- Drawer front -->
								<button
									type="button"
									style={`z-index: ${rowZBase + 3}; height: 100%; width: 100%; background-image: url('${base}/drawer.png'); background-size: cover; background-position: center;`}
									class={`relative cursor-pointer rounded-md transition-[background-color,transform] duration-600 ease-in-out hover:translate-y-2.5 ${
										isOpen ? 'translate-y-2.5' : ''
									} ${isPlaying ? 'bg-orange-100' : 'bg-orange-50'}`}
									aria-label={item.label}
									onclick={() => {
										onSelect(item);
									}}
								>
									<!-- Drawer label -->
									<span
										aria-hidden="true"
										style="position: absolute; top: 16px; left: 50%; transform: translateX(-50%); z-index: 9999;"
										class="roundedpx-2 pointer-events-none py-1 text-center font-mono text-xs leading-none font-extralight tracking-wide whitespace-nowrap text-black"
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

	.reverb-wave {
		position: absolute;
		top: 0;
		left: 50%;
		width: 56%;
		height: 20px;
		border-radius: 999px 999px 0 0;
		border: 2px solid gray;
		border-bottom: 0;
		opacity: 0;
		transform: translate(-50%, 0) scale(0.96);
		animation: reverb-pulse 1.5s ease-out infinite;
	}

	.reverb-wave-2 {
		animation-delay: 0.35s;
	}

	.reverb-wave-3 {
		animation-delay: 0.7s;
	}

	@keyframes reverb-pulse {
		0% {
			opacity: 0.55;
			transform: translate(-50%, 0) scale(0.96);
		}

		100% {
			opacity: 0;
			transform: translate(-50%, -18px) scale(1.28);
		}
	}
</style>
