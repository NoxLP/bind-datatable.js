import { createRow, buildCell } from "../view/creation.js";

let isScrolling = false
let lastScrollingInterval

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
  let rowOffset = firstShownRowIndex * rowHeight
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
  if (isScrolling) {
    if (lastScrollingInterval) clearInterval(lastScrollingInterval)

    lastScrollingInterval = setInterval(
      onScrollHandler(e, container, table, current, shown, config),
      250
    )

    return
  }

  isScrolling = true
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
    )

  console.log('>>>>>>>>>>>>>');
  console.log(table.virtualConfig);
  const firstOldIndex = table.rows[0].dataIndex
  const lastOldIndex = table.rows[table.rows.length - 1].dataIndex
  if (firstOldIndex < table.virtualConfig.firstShownRowIndex) {
    console.log('MENOR');
    // remove currently not shown rows BEFORE current shown rows
    const oldRows = [...table.rows]

    for (let i = 0; i < oldRows.length; i++) {
      const oldRow = oldRows[i];
      if (oldRow.dataIndex < table.virtualConfig.firstShownRowIndex) {
        oldRow.row.remove()
        table.rows.splice(i, 1)
      } else break
    }

    if (table.virtualConfig.lastShownRowIndex > lastOldIndex) {
      // add new rows
      for (let i = lastOldIndex + 1; i < table.virtualConfig.lastShownRowIndex; i++) {
        const rowObject = createRow(i, current[i], config.columns, config.headers)
        table.rows.push(rowObject)
        table.table.appendChild(rowObject.row)
      }
    }
  } else if (lastOldIndex > table.virtualConfig.lastShownRowIndex) {
    // remove currently not shown rows AFTER current shown rows
    const oldRows = { ...table.rows }
    console.log(oldRows);

    for (let i = oldRows.length - 1; i > 0; i--) {
      const oldRow = oldRows[i];
      console.log('TO REMOVE ', oldRow);
      if (oldRow.dataIndex > table.virtualConfig.lastShownRowIndex) {
        oldRow.row.remove()
        table.rows.splice(i, 1)
        console.log(table.rows);
      } else break
    }

    if (table.virtualConfig.firstShownRowIndex < firstOldIndex) {
      // add new rows
      for (let i = table.virtualConfig.firstShownRowIndex; i < firstOldIndex; i++) {
        const rowObject = createRow(i, current[i], config.columns, config.headers)
        table.rows.push(rowObject)
        table.table.appendChild(rowObject.row)
      }
    }
  }

  isScrolling = false
}