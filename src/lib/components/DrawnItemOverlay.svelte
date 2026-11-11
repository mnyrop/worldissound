<script>
	let { item, onClose = () => {}, isPlaying = false, onTogglePlayback = () => {} } = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
	role="dialog"
	aria-modal="true"
	aria-label={item.label}
>
	<div class="relative w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
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
