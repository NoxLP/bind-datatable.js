import { viewportDataWithConstantHeight, getRowHeightWithConstantHeight, viewportDataWithDifferentHeights, getRowHeightMeanWithDifferentHeight } from "../virtual/virtual.js";
import { createRow } from "./domTableOperations.js";

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
  bindedTable.rowHeight = config.constantRowHeight
    ? getRowHeightWithConstantHeight(data, config, container)
    : getRowHeightMeanWithDifferentHeight(data, config, container)
  const virtualConfig = viewportDataWithConstantHeight(
    container,
    bindedTable.rowHeight,
    config.lastRowBottomOffset,
    data,
    config.virtualSafeRows,
    config.rowsGutter
  )

  for (let i = virtualConfig.firstShownRowIndex; i < virtualConfig.lastShownRowIndex; i++) {
    const datarow = data[i]
    const rowObject = createRow(i, datarow, config.columns, config.headers)

    table.appendChild(rowObject.row)
    bindedTable.rows.push(rowObject)
  }

  bindedTable.virtualConfig = virtualConfig

  scroller.style.minHeight = `${virtualConfig.totalHeight}px`
  bindedTable.scroller = scroller
  return bindedTable
}
