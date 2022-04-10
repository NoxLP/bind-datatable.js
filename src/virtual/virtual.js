import { createRow } from "../view/creation.js";

let isScrolling = false
let scrollChecked = false

export function viewportDataWithDifferentHeights(container, rows, lastRowBottomOffset, safeRows = 10, rowGutter = 0) {
  let totalHeight = 0

  let firstShownRowIndex = undefined
  let rowOffset = undefined
  let shownHeight = undefined
  let lastShownRowIndex = undefined

  for (let i = 0; i < rows.length; i++) {
    const rowElement = rows[i].row;
    totalHeight += rowElement.clientHeight + rowGutter
    if (shownHeight != undefined && lastShownRowIndex == undefined)
      shownHeight += rowElement.clientHeight + rowGutter

    if (firstShownRowIndex == undefined && totalHeight > container.scrollTop) {
      firstShownRowIndex = i
      rowOffset = totalHeight
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
    rowOffset -= (rowOffset / totalShownRows) * safeRows
    rowOffset = rowOffset < 0 ? 0 : rowOffset < 0 ? 0 : rowOffset + (lastShownRowIndex == rows.length - 1
      ? lastRowBottomOffset ?? rowHeight * 5 : 0)
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
    rowOffset,
    lastShownRowIndex
  }
}

export function viewportDataWithConstantHeight(container, rowHeight, lastRowBottomOffset, rows, safeRows = 10, rowGutter = 0) {
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
  let rowOffset = firstShownRowIndex * rowHeight
  rowOffset = rowOffset < 0 ? 0 : rowOffset + (lastShownRowIndex == rows.length - 1
    ? lastRowBottomOffset ?? rowHeight * 5 : 0)

  firstShownRowIndex = Math.floor(firstShownRowIndex)
  lastShownRowIndex = Math.floor(lastShownRowIndex)

  return {
    totalHeight,
    totalShownRows,
    firstShownRowIndex,
    rowOffset,
    lastShownRowIndex
  }
}

export function onScrollHandler(
  container,
  table,
  current,
  config
) {
  if (isScrolling) return
  isScrolling = true
  scrollChecked = false

  // calculate new virtual data
  table.virtualConfig = config.constantRowHeight
    ? viewportDataWithConstantHeight(
      container,
      table.rowHeight,
      config.lastRowBottomOffset,
      current,
      config.virtualSafeRows || 10,
      config.rowsGutter || 0
    )
    : viewportDataWithDifferentHeights(
      container,
      current,
      lastRowBottomOffset,
      config.virtualSafeRows || 10,
      config.rowsGutter || 0
    );

  // remove rows
  let i = 0
  while (i < table.rows.length - 1) {
    if (table.rows[i].dataIndex < table.virtualConfig.firstShownRowIndex ||
      table.rows[i].dataIndex > table.virtualConfig.lastShownRowIndex) {
      table.rows[i].row.remove()
      table.rows.splice(i, 1)
    } else i++
  }

  // add rows
  const firstOld = table.rows[0]?.dataIndex
  const lastOld = table.rows[table.rows.length - 1]?.dataIndex
  let insertIndex = 0

  for (let i = table.virtualConfig.firstShownRowIndex;
    i <= table.virtualConfig.lastShownRowIndex;
    i++
  ) {
    if (firstOld && i < firstOld) {
      const rowObject = createRow(i, current[i], config.columns, config.headers)
      table.rows.splice(insertIndex, 0, rowObject)
      insertIndex++
      table.table.insertBefore(rowObject.row, table.rows[insertIndex].row)
    } else if (!firstOld || i > lastOld) {
      const rowObject = createRow(i, current[i], config.columns, config.headers)
      table.rows.push(rowObject)
      table.table.appendChild(rowObject.row)
    }
  }
  table.rows.forEach((r) => r.row.style.transform = `translateY(${table.virtualConfig.rowOffset}px)`)

  setTimeout(() => {
    isScrolling = false
  }, 100)
  setTimeout(() => {
    checkScroll(
      container,
      table,
      current,
      config
    )
  }, 250);
}

export function checkScroll(
  container,
  table,
  current,
  config
) {
  if (isScrolling || scrollChecked) return

  const currentVirtual = config.constantRowHeight
    ? viewportDataWithConstantHeight(
      container,
      table.rowHeight,
      current,
      config.virtualSafeRows || 10,
      config.rowsGutter || 0
    )
    : viewportDataWithDifferentHeights(
      container,
      table.rowHeight,
      current,
      config.virtualSafeRows || 10,
      config.rowsGutter || 0
    );

  if (currentVirtual.firstShownRowIndex != table.virtualConfig.firstShownRowIndex
    || currentVirtual.lastShownRowIndex != table.virtualConfig.lastShownRowIndex) {
    onScrollHandler(
      container,
      table,
      current,
      config)
  }

  scrollChecked = true
}