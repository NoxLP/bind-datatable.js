import { Error } from "../error.js";
import { viewportDataWithConstantHeight, viewportDataWithDifferentHeights } from "../view/virtual.js";

export function buildCell(cell, cellColumn, cellData) {
  cell.innerHTML = cellColumn.template ? cellColumn.template(cellData) : cellData ?? ''
  cell.style.cssText += cellColumn.style ? cellColumn.style(cellData) : ''

  if (cellColumn.cellEvents) {
    cellColumn.cellEvents.forEach((event) => {
      cell.addEventListener(event.name(cellData), (e) => event.callback(cellData, e), true)
    })
  }

  return cell
}

export function createRow(datarow, columns, headers) {
  const row = document.createElement('tr')
  let key, cellData, setData, cells
  if (Array.isArray(datarow)) {
    cells = []
    setData = (cellIndex) => {
      key = cellIndex
      cellData = datarow[cellIndex]
    }
  }
  else {
    cells = {}
    setData = (cellIndex) => {
      key = headers[cellIndex].key ?? headers[cellIndex].toLowerCase()
      cellData = datarow[key]
    }
  }

  for (let i = 0; i < headers.length; i++) {
    setData(i)

    const cellColumn = columns[i]
    const cell = buildCell(document.createElement('td'), cellColumn, cellData)

    row.appendChild(cell)
    cells[key] = cell
  }

  return { row, cells }
}

export function initTable(container, config, data) {
  const table = document.createElement('table')
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
  console.log(config.constantRowHeight)
  if (config.constantRowHeight) {
    console.log('CONSTANT')
    // Calculate rows height by drawing first row keeping it hidden
    const firstRow = createRow(data[0], config.columns, config.headers)
    firstRow.row.style.visibility = 'hidden'
    container.appendChild(firstRow.row)
    const rowHeight = firstRow.row.clientHeight
    firstRow.row.remove()
    console.log(container.children)
    console.log(rowHeight)

    const virtualConfig = viewportDataWithConstantHeight(
      container,
      rowHeight,
      data,
      config.virtualSafeRows || 10, config.rowsGutter || 0
    )
    console.log(virtualConfig)
    table.style.height = virtualConfig.totalHeight

    for (let i = virtualConfig.firstShownRowIndex; i < virtualConfig.lastShownRowIndex; i++) {
      const datarow = data[i]
      const rowTuplet = createRow(datarow, config.columns, config.headers)

      table.appendChild(rowTuplet.row)
      bindedTable.rows.push({ row: rowTuplet.row, cells: rowTuplet.cells })
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


  container.appendChild(table)
  return bindedTable
}
