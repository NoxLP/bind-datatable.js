import { createVirtualConfig } from '../virtual/virtual.js'
import { updateShownheadersWidth } from './tableOperations.js'
import { createRow } from './tableOperations.js'
import { getHeaderKeyByIndex } from './headers.js'

export const buildHeaderId = (config, headerKey) =>
  `jdtHeader_${config.tableId}_${headerKey}`
export const applyStyleToHeader = (config, header) => {
  if (config.colHeadersClass) header.classList.add(config.colHeadersClass)
  if (config.colHeadersStyle) header.style = config.colHeadersStyle
}
export const applyStyleToHeaderRow = (config, row) => {
  if (config.colHeadersRowClass) row.classList.add(config.colHeadersRowClass)
  if (config.colHeadersRowStyle) row.style = config.colHeadersRowStyle
}

export function initTable(container, scroller, config, data, bindedTable) {
  const table = !bindedTable
    ? document.createElement('table')
    : bindedTable.table
  if (config.tableId && config.tableId.length != 0) table.id = config.tableId
  table.classList.add('jdt-datatable-table')
  scroller.appendChild(table)

  // This will hold references to DOM elements to perform binding later on,
  // and other configurations
  bindedTable = !bindedTable ? { table } : bindedTable
  console.log(bindedTable)

  // Create headers
  if (config.fixedHeaders) {
    const tableHeaders = document.createElement('table')
    tableHeaders.classList.add('jdt-datatable-headers-table')
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
    bindedTable.headersTable = tableHeaders
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
      const headerKey = getHeaderKeyByIndex(j, config)
      bindedTable.cols[headerKey] = col

      const headertemplate = config.headers[j].template ?? config.headers[j]
      const header = document.createElement('th')
      header.scope = 'col'
      header.id = buildHeaderId(config, headerKey)

      if (config.sortColumns && config.sortColumns[headerKey]) {
        applyStyleToHeader(config, header)
        header.classList.add('jdt-header-sort')
        const sortButton = document.createElement('button')
        sortButton.className = 'jdt-header-sort-button'
        sortButton.id = header.id + '_sortButton'

        const templateDiv = document.createElement('div')
        sortButton.appendChild(templateDiv)
        applyStyleToHeader(config, templateDiv)
        templateDiv.innerHTML = headertemplate
        templateDiv.classList.add('jdt-header-sort-template')

        const sortIconsDiv = document.createElement('div')
        sortButton.appendChild(sortIconsDiv)
        applyStyleToHeader(config, sortIconsDiv)
        sortIconsDiv.classList.add('jdt-header-sort-icons')
        sortIconsDiv.innerHTML = `
        <div class="jdt-header-sort-top-icon">&#9651</div>
        <div class="jdt-header-sort-bottom-icon">&#9661</div>
        `

        header.appendChild(sortButton)
      } else {
        applyStyleToHeader(config, header)
        header.innerHTML = headertemplate
      }

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
      const headerKey = getHeaderKeyByIndex(j, config)
      const header = document.createElement('th')
      header.scope = 'col'
      header.id = buildHeaderId(config, headerKey)
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

  if (
    bindedTable.virtualConfig.lastRowIndex -
      bindedTable.virtualConfig.firstRowIndex >
    0
  ) {
    for (
      let i = bindedTable.virtualConfig.firstRowIndex;
      i <= bindedTable.virtualConfig.lastRowIndex;
      i++
    ) {
      const datarow = data[i]
      const rowObject = createRow(i, datarow, config, bindedTable)

      body.appendChild(rowObject.row)
      bindedTable.rows.push(rowObject)
    }
  }
  scroller.style.minHeight = `${bindedTable.virtualConfig.totalHeight}px`

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

export function reDraw(data, table, container, config) {
  const [virtualConfig, currentScroll] = createVirtualConfig(
    container,
    data,
    config,
    table
  )
  table.virtualConfig = virtualConfig
  table.rows.forEach((r) => {
    r.row.remove()
  })
  table.headers.forEach((h) => {
    h.remove()
  })
  table.headers = []
  table.rows = []
  table.headersRow.remove()
  table.headersRow = ''
  table.headersTable.remove()
  table.headersTable = ''
  table.table.getElementsByTagName('colgroup')[0].remove()
  initTable(container, table.scroller, config, data, table)
}
