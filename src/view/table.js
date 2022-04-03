import { Error } from "../error.js";

function createCell(cellColumn, cellData) {
  const cell = document.createElement('td')
  cell.innerHTML = cellColumn.template ? cellColumn.template(cellData) : cellData ?? ''
  cell.style.cssText += cellColumn.style ? cellColumn.style(cellData) : ''

  if (cellColumn.cellEvents) {
    cellColumn.cellEvents.forEach((event) => {
      console.log(event);
      cell.addEventListener(event.name(cellData), (e) => event.callback(cellData, e), true)
    })
  }

  return cell
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
    const row = document.createElement('tr')
    let key, cellData, setData
    if (Array.isArray(datarow)) {
      bindedTable.rows.push([])
      setData = (j) => {
        key = j
        cellData = datarow[j]
      }
    }
    else {
      bindedTable.rows.push({})
      setData = (j) => {
        key = headers[j].key ?? headers[j].toLowerCase()
        cellData = datarow[key]
      }
    }

    for (let j = 0; j < headers.length; j++) {
      setData(j)

      const cellColumn = columns[j]
      const cell = createCell(cellColumn, cellData)

      row.appendChild(cell)
      bindedTable.rows[i][key] = cell
    }

    table.appendChild(row)
  }

  container.appendChild(table)
  return bindedTable
}

export function updateCell(table, change, config) {
  // change.path have an ordered full path to the updated property
  let updated = table.rows[change.path[0]]
  for (let i = 1; i < change.path.length; i++) {
    updated = updated[change.path[i]]
  }

  let col = change.path[1]
  if (!(/^\d+$/.test(col))) {
    col = config.headers.findIndex((h) => h.key == col)
  }

  updated.innerHTML = ''
  updated.appendChild(createCell(config.columns[col], change.value))
}