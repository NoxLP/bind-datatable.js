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

export function createRow(dataIndex, datarow, columns, headers) {
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

  return { row, dataIndex, cells }
}