<script>
	let {
		item,
		onClose = () => {},
		isPlaying = false,
		onTogglePlayback = () => {},
		currentTime = 0,
		duration = 0,
		volume = 1,
		playbackRate = 1,
		onSeek = () => {},
		onVolumeChange = () => {},
		onPlaybackRateChange = () => {}
	} = $props();

	function formatTime(totalSeconds) {
		const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
		const minutes = Math.floor(safeSeconds / 60);
		const seconds = safeSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, '0')}`;
	}
</script>

<div
	class="overlay-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
	role="dialog"
	aria-modal="true"
	aria-label={item.label}
	tabindex="-1"
	onclick={(event) => {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}}
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			onClose();
		}
	}}
>
	<div
		class="overlay-sheet relative w-full max-w-3xl overflow-hidden rounded-md bg-[#f3e6cf] shadow-2xl"
		style="aspect-ratio: 362 / 218;"
	>
		<div
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0,transparent_11%,rgba(239,68,68,0.35)_11%,rgba(239,68,68,0.35)_11.7%,transparent_11.7%),repeating-linear-gradient(180deg,transparent_0,transparent_27px,rgba(59,130,246,0.25)_28px)]"
		></div>
		<button
			type="button"
			class="absolute top-3 right-3 z-20 cursor-pointer rounded px-2 py-0.5 text-lg leading-none text-stone-700 transition-colors hover:text-stone-950"
			aria-label="Close popup"
			onclick={onClose}
		>
			×
		</button>
		<div class="relative z-10 ml-[12%] flex h-full w-[84%] flex-col justify-between px-[4%] pt-[7%] pb-[6%]">
			<h2 class="max-w-[80%] font-mono text-lg font-bold tracking-wide text-stone-900 hover:underline">
				<a href={item.src} target="_blank" rel="noreferrer">{item.label}</a>
			</h2>
			<div class="space-y-3 rounded p-3 backdrop-blur-[1px]">
				<div class="flex items-center gap-3">
					<button
						type="button"
						class="cursor-pointer rounded bg-stone-900 p-2 text-white transition-colors hover:bg-stone-700"
						aria-label={isPlaying ? `Pause ${item.label}` : `Play ${item.label}`}
						onclick={onTogglePlayback}
					>
						{#if isPlaying}
							<svg viewBox="0 0 24 24" class="h-5 w-5 fill-current" aria-hidden="true">
								<rect x="6" y="5" width="4" height="14"></rect>
								<rect x="14" y="5" width="4" height="14"></rect>
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" class="h-5 w-5 fill-current" aria-hidden="true">
								<path d="M8 5v14l11-7z"></path>
							</svg>
						{/if}
					</button>

					<input
						type="range"
						class="h-2 w-full cursor-pointer accent-stone-900"
						min="0"
						max={duration > 0 ? duration : 0}
						step="0.1"
						value={currentTime}
						disabled={duration <= 0}
						oninput={(event) => {
							onSeek(Number(event.currentTarget.value));
						}}
					/>

					<span class="text-xs text-stone-700 tabular-nums">
						{formatTime(currentTime)} / {formatTime(duration)}
					</span>
				</div>

				<div class="flex items-center gap-3">
					<span class="text-xs text-stone-800">Vol</span>
					<input
						type="range"
						class="h-2 w-full cursor-pointer accent-stone-900"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						oninput={(event) => {
							onVolumeChange(Number(event.currentTarget.value));
						}}
					/>
				</div>

				<div class="flex items-center gap-3">
					<span class="text-xs text-stone-800">Speed</span>
					<input
						type="range"
						class="h-2 w-full cursor-pointer accent-stone-900"
						min="0.5"
						max="2"
						step="0.05"
						value={playbackRate}
						oninput={(event) => {
							onPlaybackRateChange(Number(event.currentTarget.value));
						}}
					/>
					<span class="text-xs text-stone-700 tabular-nums">{playbackRate.toFixed(2)}×</span>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.overlay-backdrop {
		animation: overlay-fade-in 300ms ease-out both;
	}

	.overlay-sheet {
		animation: overlay-sheet-rise 420ms ease-in-out both;
		transform-origin: bottom center;
	}

	@keyframes overlay-fade-in {
		from {
			background-color: rgb(0 0 0 / 0%);
		}

		to {
			background-color: rgb(0 0 0 / 40%);
		}
	}

	@keyframes overlay-sheet-rise {
		from {
			opacity: 0;
			transform: translateY(80px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
