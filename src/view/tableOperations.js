const setRowStyleAndClass = (row, dataIndex, datarow, config) => {
  if (config.rowsStyle) row.style = config.rowsStyle(datarow, dataIndex)
  if (config.rowsClass) row.classList.add(config.rowsClass(datarow, dataIndex))
}

export function createRow(dataIndex, datarow, config) {
  const row = document.createElement('tr')

  // TODO: If a column with row titles is needed, here should
  // create a th with scope 'row'

  const cells = Array.isArray(datarow) ? [] : {}
  const rowObject = { row, dataIndex }

  if (config.showRowHeaders) {
    const rowHeader = document.createElement('th')
    rowHeader.scope = 'row'
    rowHeader.innerHTML = dataIndex
    row.appendChild(rowHeader)
    rowObject.rowHeader = rowHeader
    if (config.rowHeaderClass) rowHeader.classList.add(config.rowHeaderClass)
    if (config.rowHeaderStyle) rowHeader.style = config.rowHeaderStyle
  }

  setRowStyleAndClass(row, dataIndex, datarow, config)

  let key, cellData
  for (let i = 0; i < config.headers.length; i++) {
    if (Array.isArray(datarow)) {
      key = i
      cellData = datarow[i]
    }
    else {
      key = config.headers[i].key ?? config.headers[i].toLowerCase()
      cellData = datarow[key]
    }

    const cell = updateCell(document.createElement('td'), config.columns[i], cellData)

    row.appendChild(cell)
    cells[key] = cell
  }
  rowObject.cells = cells

  return rowObject
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

export function updateRow(domRow, dataIndex, datarow, config) {
  const cells = Array.isArray(datarow) ? [] : {}
  const rowObject = { row: domRow, dataIndex }
  let key, cellData, childrenSum = 0

  if (config.showRowHeaders) {
    childrenSum = 1
    domRow.children[0].innerHTML = dataIndex
    rowObject.rowHeader = domRow.children[0]
  }

  setRowStyleAndClass(domRow, dataIndex, datarow, config)

  for (let i = 0; i < config.headers.length; i++) {
    if (Array.isArray(datarow)) {
      key = i
      cellData = datarow[i]
    }
    else {
      key = config.headers[i].key ?? config.headers[i].toLowerCase()
      cellData = datarow[key]
    }

    updateCell(domRow.children[i + childrenSum], config.columns[i], cellData)
  }
  rowObject.cells = cells

  return rowObject
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

  if (config.showRowHeaders && config.fixedHeaders) {
    bindedTable.cols.rowHeaderHeader.width = row.rowHeader.clientWidth
  }

  const configColumns = config.columns.reduce((acc, curr, idx) => {
    if ('width' in curr) {
      acc.push({
        width: curr.width,
        key: typeof config.headers[idx] != 'string' ? config.headers[idx].key :
          config.headers[idx].toLowerCase()
      })
    }
    return acc
  }, [])
  if (configColumns.length > 0) {
    configColumns.forEach((cc) => {
      const width = typeof cc.width == 'string' ? cc.width : `${cc.width} px`
      bindedTable.cols[cc.key].width = width
    })
    Object.keys(row.cells).filter((key) => !configColumns.some((cc) => cc.key == key))
      .forEach((key) => {
        bindedTable.cols[key].width = `${row.cells[key].clientWidth} px`
      })
  } else {
    Object.keys(row.cells)
      .forEach((key) => {
        bindedTable.cols[key].width = `${row.cells[key].clientWidth} px`
      })
  }
}