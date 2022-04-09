export function viewportDataWithDifferentHeights(container, rows, safeRows = 10, rowGutter = 0) {
  let totalHeight = 0

  let firstShownRowIndex = undefined
  let firstShownRowOffset = undefined
  let shownHeight = undefined
  let lastShownRowIndex = undefined

  for (let i = 0; i < rows.length; i++) {
    const rowElement = rows[i].row;
    totalHeight += rowElement.clientHeight + rowGutter
    if (shownHeight != undefined && lastShownRowIndex == undefined)
      shownHeight += rowElement.clientHeight + rowGutter

    if (firstShownRowIndex == undefined && totalHeight > container.scrollTop) {
      firstShownRowIndex = i
      firstShownRowOffset = totalHeight
      shownHeight = totalHeight - container.scrollTop
    }

    if (firstShownRowIndex != undefined && lastShownRowIndex == undefined) {
      if (shownHeight >= container.clientHeight)
        lastShownRowIndex = i - 1
      else if (i == rows.length - 1) lastShownRowIndex = i
    }
  }

  const totalShownRows = Math.floor(lastShownRowIndex) - Math.floor(firstShownRowIndex)
  firstShownRowIndex = firstShownRowIndex - safeRows
  firstShownRowIndex = firstShownRowIndex < 0 ? 0 : firstShownRowIndex
  if (safeRows) {
    // just use a mean to calculate the offset of the safe rows
    firstShownRowOffset -= (firstShownRowOffset / totalShownRows) * safeRows
    firstShownRowOffset = firstShownRowOffset < 0 ? 0 : firstShownRowOffset
  }
  lastShownRowIndex += safeRows
  lastShownRowIndex = lastShownRowIndex > rows.length - 1
    ? rows.length - 1
    : lastShownRowIndex

  firstShownRowIndex = Math.floor(firstShownRowIndex)
  lastShownRowIndex = Math.floor(lastShownRowIndex)

  return {
    totalHeight,
    totalShownRows,
    firstShownRowIndex,
    firstShownRowOffset,
    lastShownRowIndex
  }
}

export function viewportDataWithConstantHeight(container, rowHeight, rows, safeRows = 10, rowGutter = 0) {
  //const rowHeight = rows[0].row.clientHeight
  const totalHeight = rows.length * (rowHeight + rowGutter)
  let firstShownRowIndex = container.scrollTop / (rowHeight - rowGutter)
  let lastShownRowIndex = firstShownRowIndex + (container.clientHeight / (rowHeight + 2 * rowGutter))
  const totalShownRows = Math.floor(lastShownRowIndex) - Math.floor(firstShownRowIndex)

  firstShownRowIndex = firstShownRowIndex - safeRows
  firstShownRowIndex = firstShownRowIndex < 0 ? 0 : firstShownRowIndex
  lastShownRowIndex = lastShownRowIndex + safeRows
  lastShownRowIndex = lastShownRowIndex > rows.length - 1
    ? rows.length - 1
    : lastShownRowIndex
  let firstShownRowOffset = firstShownRowIndex * rowHeight
  firstShownRowOffset = firstShownRowOffset < 0 ? 0 : firstShownRowOffset

  firstShownRowIndex = Math.floor(firstShownRowIndex)
  lastShownRowIndex = Math.floor(lastShownRowIndex)

  return {
    totalHeight,
    totalShownRows,
    firstShownRowIndex,
    firstShownRowOffset,
    lastShownRowIndex
  }
}