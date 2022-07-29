const setRowStyleAndClass = (row, dataIndex, datarow, config) => {
  if (config.rowsStyle) row.style = config.rowsStyle(datarow, dataIndex)
  if (config.rowsClass) row.className = config.rowsClass(datarow, dataIndex)
}

const pushSelectedRowInMultipleSelection = (rowObject, table, config) => {
  if (rowObject.isSelected) return

  rowObject.isSelected = true
  rowObject.row.classList.toggle(config.selectedRowClass)
  table.selectedRows.push(rowObject)
  rowObject.selectedIndex = table.selectedRows.length - 1
  table.selectedRows.sort((a, b) => a.dataIndex - b.dataIndex)
}

const unselectRowInMultipleSelection = (rowObject, table, config) => {
  if (!rowObject.isSelected) return

  delete rowObject.isSelected
  rowObject.row.classList.remove(config.selectedRowClass)
  for (
    let i = rowObject.selectedIndex + 1;
    i < table.selectedRows.length;
    i++
  ) {
    const row = table.selectedRows[i]
    row.selectedIndex--
  }
  table.selectedRows.splice(rowObject.selectedIndex, 1)
  delete rowObject.selectedIndex
}

const setRowsSelectionInMultipleSelection = (
  first,
  last,
  table,
  config,
  select
) => {
  if (select) {
    for (let i = first; i <= last; i++) {
      const rowObject = table.rows[i]
      pushSelectedRowInMultipleSelection(rowObject, table, config)
    }
  } else {
    for (let i = last; i >= first; i--) {
      const rowObject = table.rows[i + table.virtualConfig.firstShownRowIndex]
      unselectRowInMultipleSelection(rowObject, table, config)
    }
  }
}

const clickRowCallback = (e, row, rowObject, table, config) => {
  console.log('CLICK ', rowObject.dataIndex)
  if (config.multipleSelection) {
    // multiple selection
    if (e.shiftKey) {
      // shift key pressed
      e.preventDefault()
      if (table.selectedRows.length > 0) {
        console.log('MAYOR 0')
        // there are already selected rows
        const currentFirstSelectedRow = table.selectedRows[0].dataIndex
        const currentLastSelectedRow =
          table.selectedRows[table.selectedRows.length - 1].dataIndex
        console.log(currentFirstSelectedRow, currentLastSelectedRow)
        let firstShownIndex, lastShownIndex, select
        if (currentFirstSelectedRow > rowObject.dataIndex) {
          // click above current selected rows
          firstShownIndex = rowObject.dataIndex
          lastShownIndex = currentLastSelectedRow
          select = true
        } else if (currentLastSelectedRow < rowObject.dataIndex) {
          // click below current selected rows
          firstShownIndex = currentFirstSelectedRow
          lastShownIndex = rowObject.dataIndex
          select = true
        } else {
          // click between selected rows
          firstShownIndex = rowObject.dataIndex + 1
          lastShownIndex = currentLastSelectedRow
          select = false
        }
        setRowsSelectionInMultipleSelection(
          firstShownIndex,
          lastShownIndex,
          table,
          config,
          select
        )
      } else {
        // no selected rows
        pushSelectedRowInMultipleSelection(rowObject, table, config)
      } // end selected rows number if
    } else if (e.ctrlKey) {
      // ctrl key pressed
      e.preventDefault()
      if (table.selectedRows.length > 0) {
        // there are already selected rows
        if (rowObject.isSelected) {
          // click between selected rows
          unselectRowInMultipleSelection(rowObject, table, config)
        } else {
          pushSelectedRowInMultipleSelection(rowObject, table, config)
        }
      } else {
        // no selected rows
        pushSelectedRowInMultipleSelection(rowObject, table, config)
      }
    } else {
      // no shift or ctrl key pressed
      if (table.selectedRows.length > 0) {
        setRowsSelectionInMultipleSelection(
          table.selectedRows[0].dataIndex,
          table.selectedRows[table.selectedRows.length - 1].dataIndex,
          table,
          config,
          false
        )
      }
      pushSelectedRowInMultipleSelection(rowObject, table, config)
    } // end shift key pressed if
  } else {
    //single selection
    if (!rowObject.isSelected) {
      //select row
      rowObject.isSelected = true
      row.classList.toggle(config.selectedRowClass)
      if (table.selectedRow) {
        table.selectedRow.row.classList.toggle(config.selectedRowClass)
        delete table.selectedRow.isSelected
      }
      table.selectedRow = rowObject
    } else {
      //unselect row
      delete rowObject.isSelected
      row.classList.toggle(config.selectedRowClass)
      table.selectedRow = undefined
    }
  } // end single or multiple selection if
}

export const filterRow = (dataIndex, datarow, config) =>
  !('filter' in config) ||
  typeof config.filter != 'function' ||
  config.filter(datarow, dataIndex)

export function createRow(dataIndex, datarow, config, table) {
  const row = document.createElement('tr')

  // TODO: If a column with row titles is needed, here should
  // create a th with scope 'row'

  const cells = Array.isArray(datarow) ? [] : {}
  const rowObject = { row, dataIndex }
  if (config.id in datarow) rowObject[config.id] = datarow[config.id]

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

  if (config.selectRows) {
    row.addEventListener('mousedown', (e) =>
      clickRowCallback(e, row, rowObject, table, config)
    )

    if (
      !config.multipleSelection &&
      table.selectedRow &&
      table.selectedRow.dataIndex == dataIndex
    ) {
      //single selection
      rowObject.isSelected = true
      row.classList.add(config.selectedRowClass)
      table.selectedRow = rowObject
    } else if (table.selectedRows && table.selectedRows.length > 0) {
      //multiple selection
      const index = table.selectedRows.findIndex(
        (ro) => ro.dataIndex == dataIndex
      )
      if (index != -1) {
        rowObject.isSelected = true
        row.classList.add(config.selectedRowClass)
        rowObject.selectedIndex = index
        table.selectedRows[index] = rowObject
      }
    }
  }

  let key, cellData
  for (let i = 0; i < config.headers.length; i++) {
    if (Array.isArray(datarow)) {
      key = i
      cellData = datarow[i]
    } else {
      key = config.headers[i].key ?? config.headers[i].toLowerCase()
      cellData = datarow[key]
    }

    const cell = updateCell(
      document.createElement('td'),
      config.columns[i],
      cellData
    )

    row.appendChild(cell)
    cells[key] = cell
  }
  rowObject.cells = cells

  return rowObject
}

export function checkRowKeys(data, headers) {
  if (data == null || headers == null) return false
  const dataKeys = Object.keys(data)

  if (dataKeys.length !== headers.length) return false

  dataKeys.sort((a, b) => a + b)
  headers = headers.map((h) => h.key ?? h.toLowerCase()).sort((a, b) => a + b)

  for (let i = 0; i < dataKeys.length; i++) {
    if (dataKeys[i] != headers[i]) return false
  }
  return true
}

export function updateRow(domRow, dataIndex, datarow, config) {
  const cells = Array.isArray(datarow) ? [] : {}
  const rowObject = { row: domRow, dataIndex }
  let key,
    cellData,
    childrenSum = 0

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
    } else {
      key = config.headers[i].key ?? config.headers[i].toLowerCase()
      cellData = datarow[key]
    }

    updateCell(domRow.children[i + childrenSum], config.columns[i], cellData)
  }
  rowObject.cells = cells

  return rowObject
}

export function updateCell(cell, cellColumn, cellData) {
  cell.innerHTML = cellColumn.template
    ? cellColumn.template(cellData)
    : cellData ?? ''
  cell.style.cssText += cellColumn.style ? cellColumn.style(cellData) : ''

  if (cellColumn.cellEvents) {
    cellColumn.cellEvents.forEach((event) => {
      cell.addEventListener(
        event.name(cellData),
        (e) => event.callback(cellData, e),
        true
      )
    })
  }

  return cell
}

// TODO: export function updateAllNextShownDataindexes()

export function updateShownheadersWidth(bindedTable, config) {
  const row =
    bindedTable.rows[
      bindedTable.virtualConfig.firstRowIndex == 0 ? 0 : config.virtualSafeRows
    ]
  if (!row) return

  if (config.showRowHeaders && config.fixedHeaders) {
    bindedTable.cols.rowHeaderHeader.width = row.rowHeader.clientWidth
  }

  const configColumns = config.columns.reduce((acc, curr, idx) => {
    if ('width' in curr) {
      acc.push({
        width: curr.width,
        key:
          typeof config.headers[idx] != 'string'
            ? config.headers[idx].key
            : config.headers[idx].toLowerCase(),
      })
    }
    return acc
  }, [])
  if (configColumns.length > 0) {
    configColumns.forEach((cc) => {
      const width = typeof cc.width == 'string' ? cc.width : `${cc.width} px`
      bindedTable.cols[cc.key].width = width
    })
    Object.keys(row.cells)
      .filter((key) => !configColumns.some((cc) => cc.key == key))
      .forEach((key) => {
        bindedTable.cols[key].width = `${row.cells[key].clientWidth} px`
      })
  } else {
    Object.keys(row.cells).forEach((key) => {
      bindedTable.cols[key].width = `${row.cells[key].clientWidth} px`
    })
  }
}
