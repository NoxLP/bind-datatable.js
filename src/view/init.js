import {
  ROW_HEIGHT_MODES,
  viewportDataWithConstantHeight,
  getRowHeightWithConstantHeight,
  viewportDataWithDifferentHeights,
  calculateAllHeights,
  getRowHeightMeanWithDifferentHeight,
} from "../virtual/virtual.js";
import { createRow, updateShownheadersWidth } from "./tableOperations.js"

export function initTable(container, scroller, config, data) {
  const table = document.createElement('table')
  table.classList.add('pb-datatable-table')
  scroller.appendChild(table)

  // This will hold references to DOM elements to perform binding later on,
  // and other configurations
  const bindedTable = { table }

  // Create headers
  if (config.fixedHeaders) {
    const tableHeaders = document.createElement('table')
    tableHeaders.classList.add('pb-datatable-headers-table')
    const colGroup = document.createElement('colgroup')
    tableHeaders.appendChild(colGroup)
    const head = document.createElement('thead')
    tableHeaders.appendChild(head)
    const headersRow = document.createElement('tr')
    bindedTable.headersRow = headersRow
    container.appendChild(tableHeaders)

    bindedTable.headers = []
    bindedTable.cols = {}
    for (let j = 0; j < config.headers.length; j++) {
      const col = document.createElement('col')
      colGroup.appendChild(col)
      const headerKey = config.headers[j].key ?? config.headers[j].toLowerCase()
      bindedTable.cols[headerKey] = col

      const headertemplate = config.headers[j].template ?? config.headers[j]
      const header = document.createElement('th')
      header.innerHTML = headertemplate

      headersRow.appendChild(header)
      bindedTable.headers.push(header)
    }
    head.appendChild(headersRow)
  } else {
    const head = document.createElement('thead')
    bindedTable.table.appendChild(head)
    const headersRow = document.createElement('tr')
    bindedTable.headersRow = headersRow

    bindedTable.headers = []
    for (let j = 0; j < config.headers.length; j++) {
      const headertemplate = config.headers[j].template ?? config.headers[j]
      const header = document.createElement('th')
      header.innerHTML = headertemplate

      headersRow.appendChild(header)
      bindedTable.headers.push(header)
    }
    head.appendChild(headersRow)
  }

  const body = document.createElement('tbody')
  table.appendChild(body)
  container.appendChild(scroller)

  bindedTable.tableBody = body

  // Create rows
  bindedTable.rows = []
  let virtualConfig
  if (config.rowHeightMode == ROW_HEIGHT_MODES[0]) { // constant
    bindedTable.rowHeight =
      getRowHeightWithConstantHeight(data, config, container)
    virtualConfig = viewportDataWithConstantHeight(
      container,
      bindedTable.rowHeight,
      config.lastRowBottomOffset,
      data,
      config.virtualSafeRows,
      config.rowsGutter
    )
  } else if (config.rowHeightMode == ROW_HEIGHT_MODES[1]) { // average
    bindedTable.rowHeight =
      getRowHeightMeanWithDifferentHeight(data, config, container, bindedTable.cols)
    console.log('avergae ', bindedTable.rowHeight)
    virtualConfig = viewportDataWithConstantHeight(
      container,
      bindedTable.rowHeight,
      config.lastRowBottomOffset,
      data,
      config.virtualSafeRows,
      config.rowsGutter
    )
  } else { // all
    bindedTable.rowHeight = calculateAllHeights(data, config, container)
    virtualConfig = viewportDataWithDifferentHeights(
      container,
      bindedTable.rowHeight,
      config.lastRowBottomOffset,
      data,
      config.virtualSafeRows,
      config.rowsGutter
    )
  }

  for (let i = virtualConfig.firstShownRowIndex; i < virtualConfig.lastShownRowIndex; i++) {
    const datarow = data[i]
    const rowObject = createRow(i, datarow, config.columns, config.headers, bindedTable.cols)

    body.appendChild(rowObject.row)
    bindedTable.rows.push(rowObject)
  }

  bindedTable.virtualConfig = virtualConfig

  scroller.style.minHeight = `${virtualConfig.totalHeight}px`
  bindedTable.scroller = scroller

  // calculate columns/headers widths => can't do in first loop because we need
  // all the elements to be created in DOM
  if (config.fixedHeaders) updateShownheadersWidth(bindedTable, config)
  if (config.columns.some((c) => 'width' in c)) {
    const colGroup = document.createElement('colgroup')
    bindedTable.table.prepend(colGroup)
    config.columns.forEach((c) => {
      if (!('width' in c)) {
        colGroup.appendChild(document.createElement('col'))
      } else {
        const col = document.createElement('col')
        colGroup.appendChild(col)
        col.width = typeof c.width == 'string' ? c.width : `${c.width} px`
      }
    })
  }

  return bindedTable
}