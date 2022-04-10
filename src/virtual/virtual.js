import { createRow } from "../view/creation.js";
import { logScroll } from "../../log.js";

let isScrolling = false

export function viewportDataWithDifferentHeights(container, rows, safeRows = 10, rowGutter = 0) {
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
    rowOffset = rowOffset < 0 ? 0 : rowOffset
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

export function viewportDataWithConstantHeight(container, rowHeight, rows, safeRows = 10, rowGutter = 0) {
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
  let rowOffset = Math.ceil((lastShownRowIndex == rows.length - 1
    ? firstShownRowIndex + 3
    : firstShownRowIndex) * rowHeight)
  rowOffset = rowOffset < 0 ? 0 : rowOffset

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
  e,
  container,
  table,
  current,
  shown,
  config
) {
  if (isScrolling) return

  isScrolling = true
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log(table.table)
  // calculate new virtual data
  table.virtualConfig = config.constantRowHeight
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
  console.log(`FROM ${table.virtualConfig.firstShownRowIndex} TO ${table.virtualConfig.lastShownRowIndex}`)

  const isScrollingDown = table.rows[0].dataIndex <= table.virtualConfig.firstShownRowIndex
  console.log('DOWN ', isScrollingDown)
  let firstToRemove, firstToAdd, lastToRemove, lastToAdd
  if (isScrollingDown) {
    firstToAdd = table.rows[table.rows.length - 1].dataIndex + 1
    lastToAdd = table.virtualConfig.lastShownRowIndex
    firstToRemove = 0
    lastToRemove = table.virtualConfig.firstShownRowIndex - table.rows[0].dataIndex
  } else {
    firstToAdd = table.virtualConfig.firstShownRowIndex
    lastToAdd = table.rows[0].dataIndex
    firstToRemove = table.rows[table.rows.length - 1].dataIndex - table.virtualConfig.lastShownRowIndex + 1
    firstToRemove = firstToRemove < 0 ? 0 : firstToRemove
    lastToRemove = table.rows.length
  }

  const rest = table.rows.splice(firstToRemove, lastToRemove - firstToRemove)
  for (let i = 0; i < rest.length; i++) {
    table.table.removeChild(rest[i].row)
  }

  const firstOld = table.rows[0]?.dataIndex
  const lastOld = table.rows[table.rows.length - 1]?.dataIndex
  let insertIndex = 0

  for (let i = table.virtualConfig.firstShownRowIndex;
    i <= table.virtualConfig.lastShownRowIndex;
    i++
  ) {
    if (firstOld && i < firstOld) {
      const rowObject = createRow(i, current[i], config.columns, config.headers)
      rowObject.row.style.transform = `translateY(${table.virtualConfig.rowOffset}px)`
      table.rows.splice(insertIndex, 0, rowObject)
      insertIndex++
      console.log(table.rows[0].row)
      table.table.insertBefore(rowObject.row, table.rows[insertIndex].row)
    } else if (!firstOld || i > lastOld) {
      const rowObject = createRow(i, current[i], config.columns, config.headers)
      rowObject.row.style.transform = `translateY(${table.virtualConfig.rowOffset}px)`
      table.rows.push(rowObject)
      table.table.appendChild(rowObject.row)
    }
  }
  table.rows.forEach((r) => r.row.style.transform = `translateY(${table.virtualConfig.rowOffset}px)`)
  logScroll(table)

  setTimeout(() => {
    isScrolling = false
  }, 100)
  setTimeout(() => {
    checkLastScroll(
      e,
      container,
      table,
      current,
      shown,
      config
    )
  }, 250);
}

function checkLastScroll(
  e,
  container,
  table,
  current,
  shown,
  config
) {
  if (isScrolling) return

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
    onScrollHandler(e,
      container,
      table,
      current,
      shown,
      config)
  }
}