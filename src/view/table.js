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
  const headersRow = document.createElement('tr')

  // Create headers
  for (let j = 0; j < headers.length; j++) {
    const headerContent = headers[j].content ?? headers[j]
    const header = document.createElement('th')
    header.innerHTML = headerContent

    headersRow.appendChild(header)
  }
  table.appendChild(headersRow)

  // Create rows
  for (let i = 0; i < data.length; i++) {
    const datarow = data[i]
    const row = document.createElement('tr')

    for (let j = 0; j < headers.length; j++) {
      let cellData, cellColumn = columns[j]
      if (Array.isArray(datarow)) {
        cellData = datarow[j]
      } else {
        const key = headers[j].key ?? headers[j].toLowerCase()
        cellData = datarow[key]
      }
      const cell = createCell(cellColumn, cellData)

      row.appendChild(cell)
    }

    table.appendChild(row)
  }

  container.appendChild(table)
  return true
}
