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
	<div class="overlay-sheet relative w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
		<button
			type="button"
			class="absolute top-3 right-3 cursor-pointer rounded p-1 text-xl leading-none text-gray-500 transition-colors hover:text-gray-800"
			aria-label="Close popup"
			onclick={onClose}
		>
			×
		</button>
		<div class="pr-8">
			<h2 class="font-mono text-lg text-gray-900 hover:underline">
				<a href={item.src} target="_blank" rel="noreferrer">{item.label}</a>
			</h2>
			<div class="mt-4 space-y-3">
				<div class="flex items-center gap-3">
					<button
						type="button"
						class="cursor-pointer rounded bg-gray-900 p-2 text-white transition-colors hover:bg-gray-700"
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
						class="h-2 w-full cursor-pointer accent-gray-900"
						min="0"
						max={duration > 0 ? duration : 0}
						step="0.1"
						value={currentTime}
						disabled={duration <= 0}
						oninput={(event) => {
							onSeek(Number(event.currentTarget.value));
						}}
					/>

					<span class="text-xs text-gray-600 tabular-nums">
						{formatTime(currentTime)} / {formatTime(duration)}
					</span>
				</div>

				<div class="flex items-center gap-3">
					<span class="text-xs text-gray-700">Vol</span>
					<input
						type="range"
						class="h-2 w-full cursor-pointer accent-gray-900"
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
					<span class="text-xs text-gray-700">Speed</span>
					<input
						type="range"
						class="h-2 w-full cursor-pointer accent-gray-900"
						min="0.5"
						max="2"
						step="0.05"
						value={playbackRate}
						oninput={(event) => {
							onPlaybackRateChange(Number(event.currentTarget.value));
						}}
					/>
					<span class="text-xs text-gray-600 tabular-nums">{playbackRate.toFixed(2)}×</span>
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
