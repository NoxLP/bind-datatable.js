import { Error } from "../error.js";
import { viewportDataWithConstantHeight, viewportDataWithDifferentHeights } from "../virtual/virtual.js";
import { createRow, buildCell } from "./creation.js";

export function initTable(container, config, data) {
  const scroller = document.createElement('div')
  container.appendChild(scroller)
  const table = document.createElement('table')
  scroller.appendChild(table)

  // This will hold references to DOM elements to perform binding later on
  const bindedTable = {
    table
  }
  const headersRow = document.createElement('tr')
  bindedTable.headersRow = headersRow

  // Create headers
  bindedTable.headers = []
  for (let j = 0; j < config.headers.length; j++) {
    const headerContent = config.headers[j].content ?? config.headers[j]
    const header = document.createElement('th')
    header.innerHTML = headerContent

    headersRow.appendChild(header)
    bindedTable.headers.push(header)
  }
  table.appendChild(headersRow)

  // Create rows
  bindedTable.rows = []
  let virtualConfig
  if (config.constantRowHeight) {
    // Calculate rows height by drawing first row keeping it hidden
    const firstRow = createRow(0, data[0], config.columns, config.headers)
    firstRow.row.style.visibility = 'hidden'
    container.appendChild(firstRow.row)
    const rowHeight = firstRow.row.clientHeight
    firstRow.row.remove()
    bindedTable.rowHeight = rowHeight

    virtualConfig = viewportDataWithConstantHeight(
      container,
      rowHeight,
      config.lastRowBottomOffset,
      data,
      config.virtualSafeRows || 10,
      config.rowsGutter || 0
    )
    console.log(virtualConfig)

    for (let i = virtualConfig.firstShownRowIndex; i < virtualConfig.lastShownRowIndex; i++) {
      const datarow = data[i]
      const rowObject = createRow(i, datarow, config.columns, config.headers)

      table.appendChild(rowObject.row)
      bindedTable.rows.push(rowObject)
    }

    bindedTable.virtualConfig = virtualConfig
  } else {
    for (let i = 0; i < data.length; i++) {
      const datarow = data[i]
      const rowTuplet = createRow(datarow, config.columns, config.headers)

      table.appendChild(rowTuplet.row)
      bindedTable.rows.push({ row: rowTuplet.row, cells: rowTuplet.cells })
    }
  }

  scroller.style.minHeight = `${virtualConfig.totalHeight}px`
  bindedTable.scroller = scroller
  return bindedTable
}
