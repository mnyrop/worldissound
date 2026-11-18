<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import DrawnGrid from '$lib/components/DrawnGrid.svelte';
	import DrawnItemOverlay from '$lib/components/DrawnItemOverlay.svelte';
	import { drawnItems } from '$lib/data/drawnItems';
	import { getCoverStage } from '$lib/utils/coverStage';

	let viewportEl = $state();
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let imageNaturalWidth = $state(1);
	let imageNaturalHeight = $state(1);
	let activeItem = $state(null);
	let playingBySrc = $state({});
	let audioMetricsBySrc = $state({});
	const audioIdBySrc = Object.fromEntries(
		drawnItems.map((item, index) => [item.audio, `drawn-audio-${index}`])
	);

	const stage = $derived(
		getCoverStage({
			viewportWidth,
			viewportHeight,
			imageNaturalWidth,
			imageNaturalHeight
		})
	);

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

	function handleItemSelect(item) {
		activeItem = item;
	}

	function closeOverlay() {
		activeItem = null;
	}

	function setPlayingState(src, isPlaying) {
		playingBySrc = {
			...playingBySrc,
			[src]: isPlaying
		};
	}

	function setAudioMetrics(src, nextMetrics) {
		audioMetricsBySrc = {
			...audioMetricsBySrc,
			[src]: {
				currentTime: 0,
				duration: 0,
				volume: 1,
				playbackRate: 1,
				...(audioMetricsBySrc[src] ?? {}),
				...nextMetrics
			}
		};
	}

	function getAudioElement(item) {
		if (!item?.audio) return null;
		const audioId = audioIdBySrc[item.audio];
		const maybeAudioEl = audioId ? document.getElementById(audioId) : null;
		return maybeAudioEl instanceof HTMLAudioElement ? maybeAudioEl : null;
	}

	function toggleItemPlayback(item) {
		const audioEl = getAudioElement(item);

		if (!audioEl) {
			console.error('Audio element not found for selected item.', { item });
			return;
		}

		if (audioEl.paused) {
			audioEl.play().catch((error) => {
				console.error('Failed to start audio playback.', { item, error });
				setPlayingState(item.audio, false);
			});
			return;
		}

		audioEl.pause();
	}

	function seekActiveItemAudio(seconds) {
		if (!activeItem) return;
		const audioEl = getAudioElement(activeItem);
		if (!audioEl) return;
		if (!Number.isFinite(audioEl.duration) || audioEl.duration <= 0) return;

		audioEl.currentTime = Math.min(Math.max(seconds, 0), audioEl.duration);
	}

	function setActiveItemVolume(volume) {
		if (!activeItem) return;
		const audioEl = getAudioElement(activeItem);
		if (!audioEl) return;

		audioEl.volume = Math.min(1, Math.max(0, volume));
	}

	function setActiveItemPlaybackRate(rate) {
		if (!activeItem) return;
		const audioEl = getAudioElement(activeItem);
		if (!audioEl) return;

		audioEl.playbackRate = Math.min(2, Math.max(0.5, rate));
	}

	const isActiveItemPlaying = $derived(Boolean(activeItem && playingBySrc[activeItem.audio]));
	const activeAudioMetrics = $derived(
		activeItem
			? (audioMetricsBySrc[activeItem.audio] ?? {
					currentTime: 0,
					duration: 0,
					volume: 1,
					playbackRate: 1
				})
			: { currentTime: 0, duration: 0, volume: 1, playbackRate: 1 }
	);

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
			style={`position: absolute; left: ${stage.stageLeft}px; top: ${stage.stageTop}px; width: ${stage.stageWidth}px; height: ${stage.stageHeight}px;`}
		>
			<img
				src={`${base}/background.jpeg`}
				alt="Draft"
				draggable="false"
				onload={handleImageLoad}
				style="display: block; width: 100%; height: 100%; user-select: none;"
			/>

			<DrawnGrid
				items={drawnItems}
				onSelect={handleItemSelect}
				{playingBySrc}
				activeAudio={activeItem?.audio ?? null}
			/>
		</div>

		{#if activeItem}
			<DrawnItemOverlay
				item={activeItem}
				onClose={closeOverlay}
				isPlaying={isActiveItemPlaying}
				onTogglePlayback={() => toggleItemPlayback(activeItem)}
				currentTime={activeAudioMetrics.currentTime}
				duration={activeAudioMetrics.duration}
				volume={activeAudioMetrics.volume}
				playbackRate={activeAudioMetrics.playbackRate}
				onSeek={seekActiveItemAudio}
				onVolumeChange={setActiveItemVolume}
				onPlaybackRateChange={setActiveItemPlaybackRate}
			/>
		{/if}

		{#each drawnItems as item (item.audio)}
			<audio
				id={audioIdBySrc[item.audio]}
				src={item.audio}
				loop
				onplay={() => {
					setPlayingState(item.audio, true);
				}}
				onpause={() => {
					setPlayingState(item.audio, false);
				}}
				onended={() => {
					setPlayingState(item.audio, false);
				}}
				onloadedmetadata={(event) => {
					const audioEl = event.currentTarget;
					setAudioMetrics(item.audio, {
						duration: Number.isFinite(audioEl.duration) ? audioEl.duration : 0,
						currentTime: audioEl.currentTime || 0,
						volume: audioEl.volume,
						playbackRate: audioEl.playbackRate
					});
				}}
				ontimeupdate={(event) => {
					const audioEl = event.currentTarget;
					setAudioMetrics(item.audio, {
						currentTime: audioEl.currentTime || 0,
						duration: Number.isFinite(audioEl.duration) ? audioEl.duration : 0
					});
				}}
				onvolumechange={(event) => {
					const audioEl = event.currentTarget;
					setAudioMetrics(item.audio, {
						volume: audioEl.volume
					});
				}}
				onratechange={(event) => {
					const audioEl = event.currentTarget;
					setAudioMetrics(item.audio, {
						playbackRate: audioEl.playbackRate
					});
				}}
			>
				<track kind="captions" />
			</audio>
		{/each}
	</div>
</div>
