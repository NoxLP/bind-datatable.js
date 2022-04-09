import { Error } from "../error.js";
import { initTable } from "../view/init.js";
import { createRow, buildCell } from "../view/creation.js";
import { clone } from "../helpers/clone.js";
import { Observable } from '../../node_modules/object-observer/dist/object-observer.min.js';
import { onScrollHandler } from "../virtual/virtual.js";

const getColIndexKey = (change, config) => (
  !(/^\d+$/.test(change.path[1]))
    ? config.headers.findIndex((h) => h.key == change.path[1])
    : change.path[1]
)

/**
 * 
 * @param {object} data Data registers array
 * @param {object} config Config object:
 * {
 *   constantRowHeight, // DEFAULT TRUE
 *   virtualSafeRows, // DEFAULT 10
 *   rowsGutter, // DEFAULT 0
 *   containerSelector, //MANDATORY
 *   columns, //MANDATORY
 *   headers, //MANDATORY
 *   rows, //TODO
 * }
 * @returns 
 */
export function DataTable(data, config) {
  if (!('containerSelector' in config) ||
    !('columns' in config) ||
    !('headers' in config)) {
    const msg = 'Bad config object. Revise mandatory options'
    Error(msg)
  }
  if (!('constantRowHeight' in config)) config.constantRowHeight = true

  const containers = document.querySelectorAll(config.containerSelector)
  if (!containers || containers.length > 1)
    Error('Found 0 or multiple table containers. Table need at least and only one container.')
  const container = containers[0]

  const current = Observable.from(data)

  const table = initTable(container, config, current)
  const shown = current.slice(table.virtualConfig.firstShownRowIndex, table.virtualConfig.lastShownRowIndex)
  container.addEventListener('scroll',
    (e) => onScrollHandler(e, container, table, current, shown, config))
  console.log(table)
  if (!table) return undefined

  Observable.observe(current, (changes) => {
    changes.forEach((change) => {
      console.log('CHANGE ', change)
      // change.path have an ordered full path to the updated property
      let updated = table.rows[change.path[0]]
      const isCellChanged = change.path.length > 1

      switch (change.type) {
        case 'update':
          console.log('UPDATE');
          if (isCellChanged) {
            // cell updated
            updated = updated.cells[change.path[1]]
            const col = getColIndexKey(change, config)

            updated.replaceWith(buildCell(updated, config.columns[col], change.value))
          } else {
            // complete row updated
            const rowTuplet = createRow(updated.dataIndex, change.value, config.columns, config.headers)

            updated.row.replaceWith(rowTuplet.row)
            table.rows[change.path[0]] = rowTuplet
          }
          break;
        case 'insert':
          console.log('INSERT')
          if (isCellChanged) {
            Error('Can not add a new cell')
            break;
          }

          const rowTuplet = createRow(change.value, config.columns, config.headers)
          table.table.appendChild(rowTuplet.row)
          table.rows.push(rowTuplet)
          break;
        case 'delete':
          console.log('DELETE')
          if (isCellChanged) {
            updated = updated.cells[change.path[1]]
            const col = getColIndexKey(change, config)
            updated.replaceWith(buildCell(updated, config.columns[col], ''))
          } else {

          }
          break;
        case 'reverse':
          break;
        case 'shuffle':
          break;
      }

    })
  })

  return {
    table,
    current,
    shown
  }
}