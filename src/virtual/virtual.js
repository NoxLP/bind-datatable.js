import { createRow, updateRow } from "../view/domTableOperations.js";

export const ROW_HEIGHT_MODES = ['constant', 'average', 'all']
let isScrolling = false
let scrollChecked = false
let lastScrollTop = 0

const getRowHeight = (row, container) => {
  row.row.style.visibility = 'hidden'
  container.appendChild(row.row)
  return row.row.clientHeight
}

const randomRange = (max, min) => {
  const range = max - min + 1
  return Math.floor(Math.random() * range) + min
}

export function getRowHeightMeanWithDifferentHeight(data, config, container) {
  let row
  let mean = 0

  if (data.length <= config.heightPrecalculationsRowsNumber) {
    row = createRow(0, data[0], config.columns, config.headers)
    mean = getRowHeight(row, container)
    for (let i = 1; i < data.length; i++) {
      row = updateRow(row.row, i, data[i], config.columns, config.headers)
      mean += getRowHeight(row, container)
    }

    mean /= data.length
  } else {
    // Divide data in "pages" to pick a row from each page until reach
    // config.heightPrecalculationsRowsNumber, and build the mean with those rows
    const rowsBetweenPage = Math.floor(data.length / config.heightPrecalculationsRowsNumber)
    row = createRow(0, data[0], config.columns, config.headers)
    mean = getRowHeight(row, container)
    for (let i = 1; i < config.heightPrecalculationsRowsNumber; i++) {
      // Add random to get a somehow "normalized" sample
      let rowIndex = Math.max(0,
        Math.min(data.length - 1, (rowsBetweenPage * i) +
          randomRange(1 - rowsBetweenPage, rowsBetweenPage - 1)
        )
      )
      row = updateRow(row.row, rowIndex, data[rowIndex], config.columns, config.headers)
      mean += getRowHeight(row, container)
    }

    mean /= config.heightPrecalculationsRowsNumber
  }

  row.row.remove()
  return mean
}

export function calculateAllHeights(data, config, container) {
  // The createRow and updateRow functions could calculate each row height, 
  // the problem is that I don't want to render more rows than strictly needed,
  // and to calculate that I need a row height

  /*
  Measured in my computer, with 1000 rows this lasts 2.5 seconds 
  more or less, with 100000 that'd be 4 minutes... 
  TODO: To avoid that large wating times:
  => data will be divided into pages, 
    at first each page will have meanHeight * numberOfRows height, 
    each time the scroll is in a page which height haven't been calculated, 
    calculate and store the real height

  At init:
    rowsHeightMean = getRowHeightMeanWithDifferentHeight
    scroll = 0 // be sure we are in the first page
    const rowsBetweenPage = Math.floor(data.length / config.heightPrecalculationsRowsNumber)
    pageFirstRow = 0
    pageLastRow = rowsBetweenPage
    pageHeight = sum of heights of rows between pageFirstRow and pageLastRow
    pagesHeights = [
      pageHeight,
      ...rowsHeightMean * rowsBetweenPage (per page)
    ]
  At scroll:
    page = calculate page with current pagesHeights
    if(page is mean) calculate real height of this page
    totalHeight = sum of page heights
    calculate rest
  */

  let row = createRow(0, data[0], config.columns, config.headers)
  const heights = data.map((reg, idx) => {
    row = updateRow(row.row, idx, reg, config.columns, config.headers)
    return getRowHeight(row, container)
  })
  row.row.remove()
  return heights
}

export function viewportDataWithDifferentHeights(
  container, rowHeights, lastRowBottomOffset, rows, safeRows = 10, rowGutter = 0) {
  let totalHeight = 0

  let firstShownRowIndex = undefined
  let rowOffset = 0
  let shownHeight = undefined
  let lastShownRowIndex = undefined

  for (let i = 0; i < rows.length; i++) {
    //const rowElement = rows[i].row;
    totalHeight += rowHeights[i] + rowGutter
    if (shownHeight != undefined && lastShownRowIndex == undefined)
      shownHeight += rowHeights[i] + rowGutter

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
    const rowHeight = totalHeight / rows.length
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

export function getRowHeightWithConstantHeight(data, config, container) {
  // Calculate rows height by drawing first row keeping it hidden
  const firstRow = createRow(0, data[0], config.columns, config.headers)
  firstRow.row.style.visibility = 'hidden'
  container.appendChild(firstRow.row)
  const rowHeight = firstRow.row.clientHeight
  firstRow.row.remove()
  return rowHeight
}

export function viewportDataWithConstantHeight(container, rowHeight, lastRowBottomOffset, rows, safeRows = 10, rowGutter = 0) {
  const totalHeight = rows.length * (rowHeight + rowGutter)
  let first = container.scrollTop / (rowHeight - rowGutter)
  let lastShownRowIndex = Math.floor(first + (container.clientHeight / (rowHeight + 2 * rowGutter)))
  const totalShownRows = lastShownRowIndex - first

  let firstShownRowIndex = Math.floor(first) - safeRows
  firstShownRowIndex = firstShownRowIndex < 0 ? 0 : firstShownRowIndex
  lastShownRowIndex = lastShownRowIndex + safeRows
  lastShownRowIndex = lastShownRowIndex > rows.length - 1
    ? rows.length - 1 : lastShownRowIndex

  first -= safeRows
  first = first < 0 ? 0 : first
  const rowOffset = first * (rowHeight + rowGutter) +
    (lastShownRowIndex == rows.length - 1
      ? lastRowBottomOffset ?? rowHeight * 5 : 0)

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
  if (isScrolling) return // throttle
  if (container.scrollTop == lastScrollTop) return //only vertical scroll
  isScrolling = true
  scrollChecked = false
  lastScrollTop = container.scrollTop

  requestAnimationFrame(() => {
    // calculate new virtual data
    table.virtualConfig = viewportDataWithConstantHeight(
      container,
      table.rowHeight,
      config.lastRowBottomOffset,
      current,
      config.virtualSafeRows,
      config.rowsGutter
    )

    // remove rows
    let i = 0
    while (i <= table.rows.length - 1) {
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
        table.tableBody.insertBefore(rowObject.row, table.rows[insertIndex].row)
      } else if (firstOld == undefined || i > lastOld) {
        const rowObject = createRow(i, current[i], config.columns, config.headers)
        table.rows.push(rowObject)
        table.tableBody.appendChild(rowObject.row)
      }
    }

    const transform = `translateY(${table.virtualConfig.rowOffset}px)`
    table.table.style.transform = transform
    table.table.style.WebkitTransform = transform
    table.table.style.MozTransform = transform
    table.table.style.OTransform = transform
    table.table.style.MsTransform = transform

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
  })
}

export function checkScroll(
  container,
  table,
  current,
  config,
  currentVirtual
) {
  if (isScrolling || scrollChecked) return

  if (!currentVirtual) {
    currentVirtual = viewportDataWithConstantHeight(
      container,
      table.rowHeight,
      config.lastRowBottomOffset,
      current,
      config.virtualSafeRows,
      config.rowsGutter
    )
  }

  if (currentVirtual.firstShownRowIndex != table.virtualConfig.firstShownRowIndex
    || currentVirtual.lastShownRowIndex != table.virtualConfig.lastShownRowIndex) {
    onScrollHandler(
      container,
      table,
      current,
      config
    )
    table.virtualConfig = currentVirtual
  }

  scrollChecked = true
}

export function onWheelHandler(e, container) {
  e.preventDefault()
  container.scrollTop += e.deltaY
}

export function onKeyDownHandler(e, container) {
  e.preventDefault()
  if (e.code == 'ArrowDown') {
    container.scrollTop += container.clientHeight / 6
  } else if (e.code == 'PageDown') {
    container.scrollTop += container.clientHeight
  } else if (e.code == 'ArrowUp' && container.scrollTop > 0) {
    container.scrollTop -= container.clientHeight / 6
  } else if (e.code == 'PageUp' && container.scrollTop > 0) {
    container.scrollTop -= container.clientHeight
  }
}