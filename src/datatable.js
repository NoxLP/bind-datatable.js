import { Error } from "./error.js";
import { initTable } from "./view/init.js";
import { createRow, checkRowKeys, updateRow, updateCell } from "./view/tableOperations.js"
import { Observable } from '../node_modules/object-observer/dist/object-observer.min.js';
import {
  ROW_HEIGHT_MODES,
  viewportDataWithConstantHeight,
  viewportDataWithDifferentHeights,
  checkScroll,
  onScrollHandler,
  onWheelHandler,
  onKeyDownHandler,
} from "./virtual/virtual.js";

const getColIndexKey = (change, config) => (
  !(/^\d+$/.test(change.path[1]))
    ? config.headers.findIndex((h) => h.key == change.path[1])
    : change.path[1]
)

const checkConfigAndSetDefaults = (config) => {
  // Check config is correct and set defaults
  if (!('containerSelector' in config) ||
    !('columns' in config) ||
    !('headers' in config)) {
    const msg = 'Bad config object. Revise mandatory options'
    Error(msg)
    return undefined
  }
  if (!('rowHeightMode' in config) || !ROW_HEIGHT_MODES.includes(config.rowHeightMode))
    config.rowHeightMode = 'constant'
  if (config.rowHeightMode != 'constant'
    && !('heightPrecalculationsRowsNumber' in config))
    config.heightPrecalculationsRowsNumber = 200
  if ('tableId' in config && typeof config.tableId != 'string') {
    config.tableId = `${config.tableId}`
  }
  if (!('virtualSafeRows' in config)) config.virtualSafeRows = 10
  if (!('rowsGutter' in config)) config.rowsGutter = 0
  if (!('fixedHeaders' in config)) config.fixedHeaders = true

  return config
}

/**
 * 
 * @param {object} data Data registers array
 * @param {object} config Config object:
 * {
 *   tableId, //OPTIONAL
 *   rowHeightMode, // [constant|average|all] DEFAULT constant
 *   heightPrecalculationsRowsNumber, //DEFAULT 200 (ignored if row height is constant)
 *   virtualSafeRows, // DEFAULT 10
 *   rowsGutter, // DEFAULT 0
 *   lastRowBottomOffset, //DEFAULT row height * 5
 *   checkUpdatedRows, //DEFAULT true
 *   fixedHeaders, //DEFAULT true
 *   containerSelector, //MANDATORY
 *   columns, //MANDATORY
 *   headers, //MANDATORY
 *   rows, //TODO
 * }
 * @returns 
 */
export function DataTable(data, config) {
  config = checkConfigAndSetDefaults(config)
  if (!config) return undefined

  const containers = document.querySelectorAll(config.containerSelector)
  if (!containers || containers.length > 1)
    Error('Found 0 or multiple table containers. Table need at least and only one container.')
  const container = containers[0]
  container.setAttribute('tabIndex', 1)
  const scroller = document.createElement('div')
  if ('tableId' in config) scroller.id = `datatable_scroller_${config.tableId}`
  scroller.classList.add('datatable_scroller')

  const current = Observable.from(data)

  const table = initTable(container, scroller, config, current)
  if (!table) return undefined
  container.addEventListener('scroll',
    () => onScrollHandler(container, table, current, config))
  container.addEventListener('wheel',
    (e) => onWheelHandler(e, container, table, current, config))
  container.addEventListener('keydown',
    (e) => onKeyDownHandler(e, container))

  Observable.observe(current, (changes) => {
    changes.forEach((change) => {
      // change.path have an ordered full path to the updated property
      let updated = table.rows[change.path[0]]
      const isCellChanged = change.path.length > 1

      switch (change.type) {
        case 'update':
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
              updateRow(updated, updated.dataIndex, change.value, config.columns, config.headers)
            }
          }
          break;
        case 'insert':
          {
            if (isCellChanged) {
              Error('Can not add a new cell')
              break;
            }

            const rowTuplet = createRow(change.value, config.columns, config.headers)

            table.tableBody.appendChild(rowTuplet.row)
            table.rows.push(rowTuplet)
            checkScroll(container, table, current, config)
            break;
          }
        case 'delete':
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
            const virtualConfig = config.rowHeightMode != ROW_HEIGHT_MODES[2]
              ? viewportDataWithConstantHeight(
                container,
                table.rowHeight,
                current,
                config.virtualSafeRows,
                config.rowsGutter
              )
              : viewportDataWithDifferentHeights(
                container,
                table.rowHeight,
                config.lastRowBottomOffset,
                current,
                config.virtualSafeRows,
                config.rowsGutter
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