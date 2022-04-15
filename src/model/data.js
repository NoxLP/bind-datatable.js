import { Error } from "../error.js";
import { initTable } from "../view/init.js";
import { createRow, checkRowKeys, updateRow, updateCell } from "../view/domTableOperations.js";
import { Observable } from '../../node_modules/object-observer/dist/object-observer.min.js';
import { viewportDataWithConstantHeight, viewportDataWithDifferentHeights, onScrollHandler, checkScroll } from "../virtual/virtual.js";

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
 *   lastRowBottomOffset, //DEFAULT row height * 5
 *   checkUpdatedRows, //DEFAULT true
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
  container.addEventListener('scroll',
    () => onScrollHandler(container, table, current, config))
  console.log(table)
  if (!table) return undefined

  Observable.observe(current, (changes) => {
    console.log('CHANGE OBSERVED')
    changes.forEach((change) => {
      console.log('CHANGE ', change)
      // change.path have an ordered full path to the updated property
      let updated = table.rows[change.path[0]]
      const isCellChanged = change.path.length > 1

      // TODO: all these can be optimized by updating innerHTML instead of creating
      // cells and rows everywhere, probably mostly at the update case
      switch (change.type) {
        case 'update':
          console.log('UPDATE');
          if (isCellChanged) {
            // cell updated
            updated = updated.cells[change.path[1]]
            const col = getColIndexKey(change, config)
            updateCell(updated, config.columns[col], change.value)
          } else {
            // complete row updated
            if ((!('checkUpdatedRows' in config) || config.checkUpdatedRows)
              && !checkRowKeys(change.value, config.headers)) {
              Error(`New value while trying to update row wasn't correct.
Some headers may be incorrect: 
${JSON.stringify(change.value, null, 4)}`)
            }
            else {
              console.log('CHECK OK')
              console.log(updated)
              updateRow(updated, updated.dataIndex, change.value, config.columns, config.headers)
            }
          }
          break;
        case 'insert':
          {
            console.log('INSERT')
            if (isCellChanged) {
              Error('Can not add a new cell')
              break;
            }

            console.log(change)
            const rowTuplet = createRow(change.value, config.columns, config.headers)
            table.table.appendChild(rowTuplet.row)
            table.rows.push(rowTuplet)
            checkScroll(container, table, current, config)
            break;
          }
        case 'delete':
          console.log('DELETE')
          if (isCellChanged) {
            updated = updated.cells[change.path[1]]
            const col = getColIndexKey(change, config)
            updated.replaceWith(updateCell(updated, config.columns[col], ''))
          } else {
            updated.row.remove()
            table.rows.splice(change.path[0], 1)
            checkScroll(container, table, current, config)
          }
          break;
        case 'reverse':
        case 'shuffle':
          {
            console.log('SHUFFLE')
            const virtualConfig = config.constantRowHeight ?
              viewportDataWithConstantHeight(
                container,
                table.rowHeight,
                current,
                config.virtualSafeRows || 10,
                config.rowsGutter || 0) :
              viewportDataWithDifferentHeights(
                container,
                table.rowHeight,
                current,
                config.virtualSafeRows || 10,
                config.rowsGutter || 0
              )

            for (let i = virtualConfig.firstShownRowIndex;
              i <= virtualConfig.lastShownRowIndex;
              i++) {
              updateRow(table.rows[i - virtualConfig.firstShownRowIndex], i, current[i], config.columns, config.headers)
            }

            checkScroll(container, table, current, config, virtualConfig)
          }
          break;
      }

    })
  })


  return {
    current,
    get table() {
      return table
    },
    get shown() {
      return current.slice(table.virtualConfig.firstShownRowIndex, table.virtualConfig.lastShownRowIndex)
    }
  }
}