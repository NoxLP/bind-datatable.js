import { createVirtualConfig } from '../virtual/virtual.js'
import { createAllRows, updateShownheadersWidth } from './tableOperations.js'

const applyStyleToHeader = (config, header) => {
  if (config.colHeadersClass) header.classList.add(config.colHeadersClass)
  if (config.colHeadersStyle) header.style = config.colHeadersStyle
}
const applyStyleToHeaderRow = (config, row) => {
  if (config.colHeadersRowClass) row.classList.add(config.colHeadersRowClass)
  if (config.colHeadersRowStyle) row.style = config.colHeadersRowStyle
}

export function initTable(container, scroller, config, data) {
  const table = document.createElement('table')
  if (config.tableId && config.tableId.length != 0) table.id = config.tableId
  table.classList.add('pb-datatable-table')
  scroller.appendChild(table)

  // This will hold references to DOM elements to perform binding later on,
  // and other configurations
  const bindedTable = { table }

  // Create headers
  if (config.fixedHeaders) {
    const tableHeaders = document.createElement('table')
    tableHeaders.classList.add('pb-datatable-headers-table')
    if (config.tableId && config.tableId.length != 0)
      tableHeaders.id = `${config.tableId}Headers`
    const colGroup = document.createElement('colgroup')
    tableHeaders.appendChild(colGroup)
    const head = document.createElement('thead')
    tableHeaders.appendChild(head)
    const headersRow = document.createElement('tr')
    applyStyleToHeaderRow(config, headersRow)
    bindedTable.headersRow = headersRow
    container.appendChild(tableHeaders)

    bindedTable.headers = []
    bindedTable.cols = {}
    if (config.showRowHeaders) {
      const rowHeaderCol = document.createElement('col')
      colGroup.appendChild(rowHeaderCol)
      bindedTable.cols.rowHeaderHeader = rowHeaderCol
      headersRow.appendChild(document.createElement('th'))
    }
    for (let j = 0; j < config.headers.length; j++) {
      const col = document.createElement('col')
      colGroup.appendChild(col)
      const headerKey = config.headers[j].key ?? config.headers[j].toLowerCase()
      bindedTable.cols[headerKey] = col

      const headertemplate = config.headers[j].template ?? config.headers[j]
      const header = document.createElement('th')
      header.scope = 'col'
      applyStyleToHeader(config, header)
      header.innerHTML = headertemplate

      headersRow.appendChild(header)
      bindedTable.headers.push(header)
    }
    head.appendChild(headersRow)
  } else {
    const head = document.createElement('thead')
    bindedTable.table.appendChild(head)
    const headersRow = document.createElement('tr')
    applyStyleToHeaderRow(config, headersRow)
    bindedTable.headersRow = headersRow

    bindedTable.headers = []
    for (let j = 0; j < config.headers.length; j++) {
      const headertemplate = config.headers[j].template ?? config.headers[j]
      const header = document.createElement('th')
      header.scope = 'col'
      applyStyleToHeader(config, header)
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
  let [virtualConfig, currentScroll] = createVirtualConfig(
    container,
    data,
    config,
    bindedTable
  )

  bindedTable.virtualConfig = virtualConfig

  createAllRows(data, bindedTable, body, config)

  scroller.style.minHeight = `${virtualConfig.totalHeight}px`
  bindedTable.scroller = scroller

  if (currentScroll) container.scrollTop = currentScroll

  // calculate columns/headers widths => can't do in first loop because we need
  // all the elements to be created in DOM
  if (config.fixedHeaders) updateShownheadersWidth(bindedTable, config)
  if (config.columns.some((c) => 'width' in c)) {
    const colGroup = document.createElement('colgroup')
    if (config.showRowHeaders) {
      const rowHeaderCol = document.createElement('col')
      colGroup.appendChild(rowHeaderCol)
      bindedTable.cols.rowHeader = rowHeaderCol
    }
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
