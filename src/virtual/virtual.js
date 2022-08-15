import {
  createRow,
  updateRow,
  updateShownheadersWidth,
} from '../table/tableOperations.js'
import {
  saveScrollOnLocalStorage,
  getScrollFromLocalStorage,
} from '../localstorage/localStorage.js'

export const ROW_HEIGHT_MODES = ['constant', 'average', 'all']

const getRowHeight = (row, container) => {
  row.row.style.visibility = 'hidden'
  container.appendChild(row.row)
  return row.row.clientHeight
}

const randomRange = (max, min) => {
  const range = max - min + 1
  return Math.floor(Math.random() * range) + min
}

export function getRowHeightMeanWithDifferentHeight(
  data,
  config,
  container,
  table
) {
  if (data.length == 0) return 0

  let row
  let mean = 0

  if (data.length <= config.heightPrecalculationsRowsNumber) {
    row = createRow(0, data[0], config, table)
    mean = getRowHeight(row, container)
    for (let i = 1; i < data.length; i++) {
      row = updateRow(row.row, i, data[i], config)
      mean += getRowHeight(row, container)
    }

    mean /= data.length
  } else {
    // Divide data in "pages" to pick a row from each page until reach
    // config.heightPrecalculationsRowsNumber, and build the mean with those rows
    const rowsBetweenPage = Math.floor(
      data.length / config.heightPrecalculationsRowsNumber
    )
    row = createRow(0, data[0], config, table)
    mean = getRowHeight(row, container)
    for (let i = 1; i < config.heightPrecalculationsRowsNumber; i++) {
      // Add random to get a somehow "normalized" sample
      let rowIndex = Math.max(
        0,
        Math.min(
          data.length - 1,
          rowsBetweenPage * i +
            randomRange(1 - rowsBetweenPage, rowsBetweenPage - 1)
        )
      )
      row = updateRow(row.row, rowIndex, data[rowIndex], config)
      mean += getRowHeight(row, container)
    }

    mean /= config.heightPrecalculationsRowsNumber
  }

  row.row.remove()
  return mean
}

export function calculateAllHeights(data, config, container, table) {
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

  let row = createRow(0, data[0], config, table)
  const heights = data.map((reg, idx) => {
    row = updateRow(row.row, idx, reg, config)
    return getRowHeight(row, container)
  })
  row.row.remove()
  return heights
}

export function viewportDataWithDifferentHeights(
  container,
  rowHeights,
  lastRowBottomOffset,
  rows,
  safeRows,
  rowGutter = 0
) {
  let totalHeight = 0

  let firstRowIndex = undefined
  let rowOffset = 0
  let shownHeight = undefined
  let lastRowIndex = undefined

  for (let i = 0; i < rows.length; i++) {
    //const rowElement = rows[i].row;
    totalHeight += rowHeights[i] + rowGutter
    if (shownHeight != undefined && lastRowIndex == undefined)
      shownHeight += rowHeights[i] + rowGutter

    if (firstRowIndex == undefined && totalHeight > container.scrollTop) {
      firstRowIndex = i
      rowOffset = totalHeight
      shownHeight = totalHeight - container.scrollTop
    }

    if (firstRowIndex != undefined && lastRowIndex == undefined) {
      if (shownHeight >= container.clientHeight) lastRowIndex = i - 1
      else if (i == rows.length - 1) lastRowIndex = i
    }
  }

  const totalShownRows = Math.floor(lastRowIndex) - Math.floor(firstRowIndex)
  firstRowIndex = firstRowIndex - safeRows
  firstRowIndex = firstRowIndex < 0 ? 0 : firstRowIndex

  if (safeRows) {
    // just use a mean to calculate the offset of the safe rows
    const rowHeight = totalHeight / rows.length
    rowOffset -= (rowOffset / totalShownRows) * safeRows
    rowOffset =
      rowOffset < 0
        ? 0
        : rowOffset < 0
        ? 0
        : rowOffset +
          (lastRowIndex == rows.length - 1
            ? lastRowBottomOffset ?? rowHeight * 5
            : 0)
  }
  lastRowIndex += safeRows

  firstRowIndex = Math.floor(firstRowIndex)
  lastRowIndex = Math.floor(lastRowIndex)
  lastRowIndex = lastRowIndex > rows.length - 1 ? rows.length - 1 : lastRowIndex
  console.log('>> LAST CALC ', lastRowIndex)

  return {
    totalHeight,
    totalShownRows,
    firstRowIndex,
    rowOffset,
    lastRowIndex,
  }
}

export function getRowHeightWithConstantHeight(data, config, container, table) {
  // Calculate rows height by drawing first row keeping it hidden
  if (data.length == 0) return 0

  const firstRow = createRow(0, data[0], config, table)
  firstRow.row.style.visibility = 'hidden'
  container.appendChild(firstRow.row)
  const rowHeight = firstRow.row.clientHeight
  firstRow.row.remove()
  return rowHeight
}

export function viewportDataWithConstantHeight(
  container,
  rowHeight,
  lastRowBottomOffset,
  rows,
  safeRows,
  rowGutter = 0,
  scrollTop = undefined
) {
  let firstShownRowIndex, lastShownRowIndex, firstRowIndex, lastRowIndex
  const totalHeight = rows.length * (rowHeight + rowGutter)

  if (scrollTop === undefined || scrollTop != totalHeight) {
    if (scrollTop === undefined) scrollTop = container.scrollTop

    firstShownRowIndex = scrollTop / (rowHeight - rowGutter)
    lastShownRowIndex = Math.min(
      Math.floor(
        firstShownRowIndex +
          container.clientHeight / (rowHeight + 2 * rowGutter)
      ),
      rows.length - 1
    )

    firstRowIndex = Math.floor(firstShownRowIndex) - safeRows
    firstRowIndex = firstRowIndex < 0 ? 0 : firstRowIndex
    lastRowIndex = Math.min(lastShownRowIndex + safeRows, rows.length - 1)
  } else {
    lastShownRowIndex = rows.length - 1

    firstShownRowIndex =
      lastShownRowIndex - container.clientHeight / (rowHeight - rowGutter)
    firstRowIndex = Math.floor(firstShownRowIndex) - safeRows
    lastRowIndex = lastShownRowIndex
  }

  const totalShownRows = lastShownRowIndex - firstShownRowIndex
  let firstWithoutFloor = firstShownRowIndex - safeRows
  firstWithoutFloor = firstWithoutFloor < 0 ? 0 : firstWithoutFloor
  lastRowBottomOffset = lastRowBottomOffset ?? rowHeight * 5
  const lastRowOffset =
    firstRowIndex * (rowHeight + rowGutter) + lastRowBottomOffset
  const normalOffset = firstWithoutFloor * (rowHeight + rowGutter)
  const rowOffset =
    scrollTop == container.clientHeight ? lastRowOffset : normalOffset
  firstShownRowIndex = Math.floor(firstShownRowIndex)

  return {
    totalHeight,
    firstRowIndex,
    lastRowIndex,
    rowOffset,
    totalShownRows,
    firstShownRowIndex,
    lastShownRowIndex,
    rowHeight,
  }
}

export function onScrollHandler(container, table, current, config) {
  if (table.virtualConfig.isScrolling) {
    // throttle
    if (config.saveScroll) {
      if (!table.virtualConfig.storageScrollSetted)
        saveScrollOnLocalStorage(container.scrollTop, table, config)
      else table.virtualConfig.storageScrollSetted = true
    }
    return
  }
  if (container.scrollTop == table.virtualConfig.lastScrollTop) return //only vertical scroll
  table.virtualConfig.isScrolling = true
  table.virtualConfig.scrollChecked = false

  requestAnimationFrame(() => {
    // calculate new virtual data
    table.virtualConfig = viewportDataWithConstantHeight(
      container,
      table.rowHeight,
      config.lastRowBottomOffset,
      current,
      config.virtualSafeRows,
      config.rowsGutter,
      undefined,
      table.virtualConfig
    )
    table.virtualConfig.lastScrollTop = container.scrollTop

    // remove rows
    let i = 0
    while (i <= table.rows.length - 1) {
      if (
        table.rows[i].dataIndex < table.virtualConfig.firstRowIndex ||
        table.rows[i].dataIndex > table.virtualConfig.lastRowIndex
      ) {
        table.rows[i].row.remove()
        table.rows.splice(i, 1)
      } else i++
    }

    // add rows
    const firstOld = table.rows[0]?.dataIndex
    const lastOld = table.rows[table.rows.length - 1]?.dataIndex
    let insertIndex = 0

    for (
      let i = table.virtualConfig.firstRowIndex;
      i <= table.virtualConfig.lastRowIndex;
      i++
    ) {
      if (firstOld && i < firstOld) {
        const rowObject = createRow(i, current[i], config, table)
        table.rows.splice(insertIndex, 0, rowObject)
        insertIndex++
        table.tableBody.insertBefore(rowObject.row, table.rows[insertIndex].row)
      } else if (firstOld == undefined || i > lastOld) {
        const rowObject = createRow(i, current[i], config, table)
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

    if (config.fixedHeaders) updateShownheadersWidth(table, config)

    if (config.saveScroll) {
      if (!table.virtualConfig.storageScrollSetted)
        saveScrollOnLocalStorage(container.scrollTop, table, config)
      else table.virtualConfig.storageScrollSetted = true
    }

    setTimeout(() => {
      table.virtualConfig.isScrolling = false
    }, 100)
    setTimeout(() => {
      checkScroll(container, table, current, config)
    }, 250)
  })
}

export function checkScroll(container, table, current, config, currentVirtual) {
  if (table.virtualConfig.isScrolling || table.virtualConfig.scrollChecked)
    return

  if (!currentVirtual) {
    currentVirtual =
      config.rowHeightMode != ROW_HEIGHT_MODES[2]
        ? viewportDataWithConstantHeight(
            container,
            table.rowHeight,
            config.lastRowBottomOffset,
            current,
            config.virtualSafeRows,
            config.rowsGutter
          )
        : viewportDataWithDifferentHeights(
            container,
            table.rowHeight,
            config.lastRowBottomOffset,
            current,
            config.virtualSafeRows,
            config.rowsGutter
          )
  }

  if (
    currentVirtual.firstRowIndex != table.virtualConfig.firstRowIndex ||
    currentVirtual.lastRowIndex != table.virtualConfig.lastRowIndex
  ) {
    onScrollHandler(container, table, current, config)
    const lastScrollTop = table.virtualConfig.lastScrollTop
    table.virtualConfig = currentVirtual
    table.virtualConfig.lastScrollTop = lastScrollTop
  }

  table.virtualConfig.scrollChecked = true
}

export function onWheelHandler(e, container) {
  e.preventDefault()
  if (!e.shiftKey) container.scrollTop += e.deltaY
  else container.scrollLeft += e.deltaY
}

export function onKeyDownHandler(e, container, table) {
  e.preventDefault()
  if (e.code == 'ArrowDown') {
    container.scrollTop += container.clientHeight / 6
  } else if (e.code == 'PageDown') {
    if (container.scrollTop == table.virtualConfig.totalHeight) return
    container.scrollTop += container.clientHeight
  } else if (e.code == 'ArrowUp' && container.scrollTop > 0) {
    container.scrollTop -= container.clientHeight / 6
  } else if (e.code == 'PageUp' && container.scrollTop > 0) {
    container.scrollTop -= container.clientHeight
  }
}

export function createVirtualConfig(container, data, config, bindedTable) {
  if (data.length == 0) {
    return [
      {
        firstRowIndex: 0,
        firstShownRowIndex: 0,
        lastRowIndex: 0,
        lastShownRowIndex: 0,
        rowHeight: 0,
        rowOffset: 0,
        totalHeight: 0,
        totalShownRows: 0,
      },
      0,
    ]
  }

  let virtualConfig, currentScroll
  const scroll = getScrollFromLocalStorage(bindedTable)

  if (config.saveScroll && scroll) {
    if (
      config.rowHeightMode != ROW_HEIGHT_MODES[1] ||
      scroll.firstShownRowIndex == undefined
    ) {
      // average
      bindedTable.rowHeight = getRowHeightWithConstantHeight(
        data,
        config,
        container,
        bindedTable
      )
      virtualConfig = viewportDataWithConstantHeight(
        container,
        bindedTable.rowHeight,
        config.lastRowBottomOffset,
        data,
        config.virtualSafeRows,
        config.rowsGutter,
        scroll.scroll
      )
    } else {
      currentScroll = scroll.scroll
      bindedTable.rowHeight = getRowHeightMeanWithDifferentHeight(
        data,
        config,
        container,
        bindedTable.cols,
        bindedTable
      )
      virtualConfig = viewportDataWithConstantHeight(
        container,
        bindedTable.rowHeight,
        config.lastRowBottomOffset,
        data,
        config.virtualSafeRows,
        config.rowsGutter,
        currentScroll
      )
      let i = 0
      while (
        virtualConfig.firstShownRowIndex != scroll.firstShownRowIndex &&
        i < 50
      ) {
        if (virtualConfig.firstShownRowIndex < scroll.firstShownRowIndex) {
          currentScroll +=
            (scroll.firstShownRowIndex - virtualConfig.firstShownRowIndex) *
            bindedTable.rowHeight
        } else {
          currentScroll +=
            (scroll.firstShownRowIndex - virtualConfig.firstShownRowIndex) *
            bindedTable.rowHeight
        }
        virtualConfig = viewportDataWithConstantHeight(
          container,
          bindedTable.rowHeight,
          config.lastRowBottomOffset,
          data,
          config.virtualSafeRows,
          config.rowsGutter,
          currentScroll
        )

        i++
      }
    }
  } else {
    if (config.rowHeightMode == ROW_HEIGHT_MODES[0]) {
      // constant
      bindedTable.rowHeight = getRowHeightWithConstantHeight(
        data,
        config,
        container,
        bindedTable
      )
      virtualConfig = viewportDataWithConstantHeight(
        container,
        bindedTable.rowHeight,
        config.lastRowBottomOffset,
        data,
        config.virtualSafeRows,
        config.rowsGutter
      )
    } else if (config.rowHeightMode == ROW_HEIGHT_MODES[1]) {
      // average
      bindedTable.rowHeight = getRowHeightMeanWithDifferentHeight(
        data,
        config,
        container,
        bindedTable.cols,
        bindedTable
      )
      virtualConfig = viewportDataWithConstantHeight(
        container,
        bindedTable.rowHeight,
        config.lastRowBottomOffset,
        data,
        config.virtualSafeRows,
        config.rowsGutter
      )
    } else {
      // all
      bindedTable.rowHeight = calculateAllHeights(
        data,
        config,
        container,
        bindedTable
      )
      virtualConfig = viewportDataWithDifferentHeights(
        container,
        bindedTable.rowHeight,
        config.lastRowBottomOffset,
        data,
        config.virtualSafeRows,
        config.rowsGutter
      )
    }
  }

  return [virtualConfig, currentScroll]
}
