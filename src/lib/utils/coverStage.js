export function getCoverStage({
	viewportWidth,
	viewportHeight,
	imageNaturalWidth,
	imageNaturalHeight
}) {
	const coverScale =
		viewportWidth > 0 && viewportHeight > 0
			? Math.max(viewportWidth / imageNaturalWidth, viewportHeight / imageNaturalHeight)
			: 1;

	const stageWidth = imageNaturalWidth * coverScale;
	const stageHeight = imageNaturalHeight * coverScale;

	return {
		stageWidth,
		stageHeight,
		stageLeft: (viewportWidth - stageWidth) / 2,
		stageTop: (viewportHeight - stageHeight) / 2
	};
}
