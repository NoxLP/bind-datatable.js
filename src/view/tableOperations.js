export function createRow(dataIndex, datarow, columns, headers) {
  const row = document.createElement('tr')

  // TODO: If a column with row titles is needed, here should
  // create a th with scope 'row'

  const cells = Array.isArray(datarow) ? [] : {}
  let key, cellData

  for (let i = 0; i < headers.length; i++) {
    if (Array.isArray(datarow)) {
      key = i
      cellData = datarow[i]
    }
    else {
      key = headers[i].key ?? headers[i].toLowerCase()
      cellData = datarow[key]
    }

    const cell = updateCell(document.createElement('td'), columns[i], cellData)

    row.appendChild(cell)
    cells[key] = cell
  }

  return { row, dataIndex, cells }
}

export function checkRowKeys(data, headers) {
  if (data == null || headers == null) return false;
  const dataKeys = Object.keys(data)

  if (dataKeys.length !== headers.length) return false;

  dataKeys.sort((a, b) => a + b)
  headers = headers
    .map((h) => h.key ?? h.toLowerCase())
    .sort((a, b) => a + b)

  for (let i = 0; i < dataKeys.length; i++) {
    if (dataKeys[i] != headers[i]) return false
  }
  return true
}

export function updateRow(domRow, dataIndex, datarow, columns, headers) {
  const cells = Array.isArray(datarow) ? [] : {}
  let key, cellData

  for (let i = 0; i < headers.length; i++) {
    if (Array.isArray(datarow)) {
      key = i
      cellData = datarow[i]
    }
    else {
      key = headers[i].key ?? headers[i].toLowerCase()
      cellData = datarow[key]
    }

    updateCell(domRow.children[i], columns[i], cellData)
  }

  return { row: domRow, dataIndex, cells }
}

export function updateCell(cell, cellColumn, cellData) {
  cell.innerHTML = cellColumn.template ? cellColumn.template(cellData) : (cellData ?? '')
  cell.style.cssText += cellColumn.style ? cellColumn.style(cellData) : ''

  if (cellColumn.cellEvents) {
    cellColumn.cellEvents.forEach((event) => {
      cell.addEventListener(event.name(cellData), (e) => event.callback(cellData, e), true)
    })
  }

  return cell
}

// TODO: export function updateAllNextShownDataindexes()

export function updateShownheadersWidth(bindedTable, config) {
  const row = bindedTable.rows[
    bindedTable.virtualConfig.firstShownRowIndex == 0
      ? 0
      : config.virtualSafeRows
  ]
  if (!row) return
  Object.keys(row.cells).forEach((key) => {
    bindedTable.cols[key].width = `${row.cells[key].clientWidth} px`
  })
}