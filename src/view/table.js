import { Error } from "../error.js";

function createCell(cellColumn, cellData) {
  const cell = document.createElement('td')
  cell.innerHTML = cellColumn.template ? cellColumn.template(cellData) : cellData ?? ''
  cell.style.cssText += cellColumn.style ? cellColumn.style(cellData) : ''

  if (cellColumn.cellEvents) {
    cellColumn.cellEvents.forEach((event) => {
      cell.addEventListener(event.name(cellData), (e) => event.callback(cellData, e), true)
    })
  }

  return cell
}

function createRow(index, datarow, columns, headers) {
  const row = document.createElement('tr')
  let key, cellData, setData, bindedRow
  if (Array.isArray(datarow)) {
    bindedRow = []
    setData = (cellIndex) => {
      key = cellIndex
      cellData = datarow[cellIndex]
    }
  }
  else {
    bindedRow = {}
    setData = (cellIndex) => {
      key = headers[cellIndex].key ?? headers[cellIndex].toLowerCase()
      cellData = datarow[key]
    }
  }

  for (let j = 0; j < headers.length; j++) {
    setData(j)

    const cellColumn = columns[j]
    const cell = createCell(cellColumn, cellData)

    row.appendChild(cell)
    bindedRow[key] = cell
  }

  return { row, bindedRow }
}

export function initTable(container, headers, columns, data) {
  const table = document.createElement('table')
  // This will hold references to DOM elements to perform binding later on
  const bindedTable = {
    table
  }
  const headersRow = document.createElement('tr')
  bindedTable.headersRow = headersRow

  // Create headers
  bindedTable.headers = []
  for (let j = 0; j < headers.length; j++) {
    const headerContent = headers[j].content ?? headers[j]
    const header = document.createElement('th')
    header.innerHTML = headerContent

    headersRow.appendChild(header)
    bindedTable.headers.push(header)
  }
  table.appendChild(headersRow)

  // Create rows
  bindedTable.rows = []
  for (let i = 0; i < data.length; i++) {
    const datarow = data[i]
    const rowTuplet = createRow(i, datarow, columns, headers)

    table.appendChild(rowTuplet.row)
    bindedTable.rows.push({ row: rowTuplet.row, cells: rowTuplet.bindedRow })
  }

  container.appendChild(table)
  return bindedTable
}

export function updateCell(updatedCell, change, config) {
  let col = change.path[1]
  if (!(/^\d+$/.test(col))) {
    col = config.headers.findIndex((h) => h.key == col)
  }

  updatedCell.replaceWith(createCell(config.columns[col], change.value))
  return updateCell
}

export function updateRow(updatedRow, index, change, config) {
  const rowTuplet = createRow(index, change.value, config.columns, config.headers)

  updatedRow.row.replaceWith(rowTuplet.row)
  return rowTuplet
}