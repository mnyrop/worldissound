<script>
	let { item, onClose = () => {}, isPlaying = false, onTogglePlayback = () => {} } = $props();
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
			<h2 class="text-lg font-semibold text-gray-900">{item.label}</h2>
			<a
				href={item.src}
				target="_blank"
				rel="noreferrer"
				class="mt-2 inline-block text-sm text-blue-600 underline"
			>
				View source
			</a>
			<button
				type="button"
				class="mt-4 rounded bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
				aria-label={isPlaying ? `Pause ${item.label}` : `Play ${item.label}`}
				onclick={onTogglePlayback}
			>
				{isPlaying ? 'Pause audio' : 'Play audio'}
			</button>
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
