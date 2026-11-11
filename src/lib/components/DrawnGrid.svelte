<script>
	let { items = [], onSelect = () => {}, gridArea, playingBySrc = {} } = $props();
</script>

<div style="position: absolute; inset: 0;">
	<div
		class="pointer-events-auto grid grid-cols-3 grid-rows-4 gap-6 overflow-hidden rounded-md"
		style={`position: absolute; left: ${gridArea.x}%; top: ${gridArea.y}%; width: ${gridArea.w}%; height: ${gridArea.h}%; box-sizing: border-box;`}
	>
		{#each items as item}
			<button
				type="button"
				class={`cursor-pointer rounded-md transition-[background-color] duration-150 ease-out ${
					playingBySrc[item.audio]
						? 'bg-blue-200 hover:bg-blue-300'
						: 'bg-orange-200 hover:bg-orange-300'
				}`}
				aria-label={item.label}
				onclick={() => {
					onSelect(item);
				}}
			></button>
		{/each}
	</div>
</div>
