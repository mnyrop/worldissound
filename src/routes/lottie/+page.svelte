<script>
	import { base } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import lottie from 'lottie-web';

	let container;
	let animation;
	let handlePointerEnter;
	let handlePointerLeave;
	let handleDomLoaded;

	onMount(() => {
		animation = lottie.loadAnimation({
			container,
			renderer: 'svg',
			loop: false,
			autoplay: false,
			path: `${base}/lottie.json`
		});

		handleDomLoaded = () => {
			animation.goToAndStop(0, true);
		};
		handlePointerEnter = () => {
			animation.goToAndPlay(0, true);
		};
		handlePointerLeave = () => {
			animation.pause();
			animation.goToAndStop(0, true);
		};

		animation.addEventListener('DOMLoaded', handleDomLoaded);
		container.addEventListener('pointerenter', handlePointerEnter);
		container.addEventListener('pointerleave', handlePointerLeave);
	});

	onDestroy(() => {
		if (animation && handleDomLoaded) {
			animation.removeEventListener('DOMLoaded', handleDomLoaded);
		}
		if (container && handlePointerEnter) {
			container.removeEventListener('pointerenter', handlePointerEnter);
		}
		if (container && handlePointerLeave) {
			container.removeEventListener('pointerleave', handlePointerLeave);
		}
		animation?.destroy();
	});
</script>

<div class="wrapper">
	<div class="lottie" bind:this={container}></div>
</div>

<style>
	.wrapper {
		display: grid;
		place-items: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.lottie {
		width: min(520px, 100%);
		aspect-ratio: 1 / 1;
		cursor: pointer;
	}
</style>
