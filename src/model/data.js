import { Error } from "../error.js";
import { initTable, updateCell } from "../view/table.js";
import { clone } from "../helpers/clone.js";
import { Observable } from '../../node_modules/object-observer/dist/object-observer.min.js';

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
      switch (change.type) {
        case 'update':
          console.log('UPDATE');
          updateCell(table, change, config)
          break;
        case 'insert':

          break;
      }

    })
  })

  return {
    current,
    shown
  }
}