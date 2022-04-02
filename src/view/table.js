import { Error } from "../error.js";

export function initTable(container, headers, columns, data) {
  if (!data.every((row) => row.length == headers.length)) {
    Error('Number of headers does not correspond with rows length')
    return false
  }

  const table = document.createElement('table')
  const headersRow = document.createElement('tr')

  // Create headers
  for (let j = 0; j < headers.length; j++) {
    const headerContent = headers[j]
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
      const cellData = datarow[j]
      const cellColumn = columns[j]
      const cell = document.createElement('td')
      cell.innerHTML = cellColumn.template ? cellColumn.template(cellData) : cellData
      cell.style.cssText += cellColumn.style ? cellColumn.style(cellData) : ''

      row.appendChild(cell)
    }

    table.appendChild(row)
  }

  container.appendChild(table)
  return true
}
