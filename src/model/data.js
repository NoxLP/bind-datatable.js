import { Error } from "../error.js";
import { initTable, createRow, buildCell } from "../view/table.js";
import { clone } from "../helpers/clone.js";
import { Observable } from '../../node_modules/object-observer/dist/object-observer.min.js';

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
 *   containerSelector,
 *   columns,
 *   headers
 * }
 * @returns 
 */
export function DataTable(data, config) {
  const original = data

  const containers = document.querySelectorAll(config.containerSelector)
  if (!containers || containers.length > 1)
    Error('Found 0 or multiple table containers. Table need at least and only one container.')
  const container = containers[0]

  let current = Observable.from(data)
  let shown = current //TODO: filter with clusterizer
  const table = initTable(container, config.headers, config.columns, current)
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
            const rowTuplet = createRow(change.value, config.columns, config.headers)

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
    current,
    shown
  }
}