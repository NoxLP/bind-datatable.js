import { Error } from './error.js'
import { initTable, reDraw } from './table/init.js'
import {
  createRow,
  checkRowKeys,
  updateRow,
  updateCell,
  updateShownheadersWidth,
} from './table/tableOperations.js'
import { Observable } from '../node_modules/object-observer/dist/object-observer.min.js'
import {
  ROW_HEIGHT_MODES,
  viewportDataWithConstantHeight,
  viewportDataWithDifferentHeights,
  checkScroll,
  onScrollHandler,
  onWheelHandler,
  onKeyDownHandler,
} from './virtual/virtual.js'

const getColIndexKey = (change, config) =>
  !/^\d+$/.test(change.path[1])
    ? config.headers.findIndex((h) => h.key == change.path[1])
    : change.path[1]

const observableChangesCallback = (
  changes,
  table,
  config,
  container,
  current
) => {
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
          if (
            (!('checkUpdatedRows' in config) || config.checkUpdatedRows) &&
            !checkRowKeys(change.value, config.headers)
          ) {
            Error(`New value while trying to update row wasn't correct.
Some headers may be incorrect: 
${JSON.stringify(change.value, null, 4)}`)
          } else {
            updateRow(updated, updated.dataIndex, change.value, config)
          }
        }
        break
      case 'insert': {
        if (isCellChanged) {
          Error('Can not add a new cell')
          break
        }

        const rowTuplet = createRow(change.value, config)

        table.tableBody.appendChild(rowTuplet.row)
        table.rows.push(rowTuplet)
        checkScroll(container, table, current, config)
        break
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
        break
      case 'reverse':
      case 'shuffle':
        {
          const virtualConfig =
            config.rowHeightMode != ROW_HEIGHT_MODES[2]
              ? viewportDataWithConstantHeight(
                  container,
                  table.rowHeight,
                  config.lastRowBottomOffset,
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

          for (let i = 0; i < table.rows.length; i++) {
            const row = table.rows[i]
            updateRow(row.row, row.dataIndex, current[row.dataIndex], config)
          }

          checkScroll(container, table, current, config, virtualConfig)
        }
        break
    }
  })
}

const checkConfigAndSetDefaults = (config) => {
  // Check config is correct and set defaults
  if (
    !('containerSelector' in config) ||
    !('columns' in config) ||
    !('headers' in config)
  ) {
    const msg = 'Bad config object. Revise mandatory options'
    Error(msg)
    return undefined
  }
  if (config.columns.length != config.headers.length) {
    for (let i = config.columns.length; i < config.headers.length; i++)
      config.columns.push({})
  }
  if (
    !('rowHeightMode' in config) ||
    !ROW_HEIGHT_MODES.includes(config.rowHeightMode)
  )
    config.rowHeightMode = 'constant'
  if (
    config.rowHeightMode != 'constant' &&
    !('heightPrecalculationsRowsNumber' in config)
  )
    config.heightPrecalculationsRowsNumber = 200
  if ('tableId' in config && typeof config.tableId != 'string') {
    config.tableId = `${config.tableId}`
  }
  if (!('virtualSafeRows' in config)) config.virtualSafeRows = 10
  if (!('rowsGutter' in config)) config.rowsGutter = 0
  if (!('fixedHeaders' in config)) config.fixedHeaders = true
  if (config.colHeadersClass && config.colHeadersClass.length == 0)
    delete config.colHeadersClass
  if (config.colHeadersStyle && config.colHeadersStyle.length == 0)
    delete config.colHeadersStyle
  if (config.colHeadersRowClass && config.colHeadersRowClass.length == 0)
    delete config.colHeadersRowClass
  if (config.colHeadersRowStyle && config.colHeadersRowStyle.length == 0)
    delete config.colHeadersRowStyle
  if (config.rowHeaderClass && config.rowHeaderClass.length == 0)
    delete config.rowHeaderClass
  if (config.rowHeaderStyle && config.rowHeaderStyle.length == 0)
    delete config.rowHeaderStyle
  if (config.rowsStyle && config.rowsStyle.length == 0) delete config.rowsStyle
  if (config.rowsClass && config.rowsClass.length == 0) delete config.rowsClass

  return config
}

/**
 *
 * @param {object} data Data registers array
 * @param {object} config Config object: see readme
 * @returns
 */
export function DataTable(data, config) {
  config = checkConfigAndSetDefaults(config)
  if (!config) return undefined

  const containers = document.querySelectorAll(config.containerSelector)
  if (!containers || containers.length > 1)
    Error(
      'Found 0 or multiple table containers. Table need at least and only one container.'
    )
  const container = containers[0]
  container.setAttribute('tabIndex', 1)
  const scroller = document.createElement('div')
  if ('tableId' in config) scroller.id = `datatable_scroller_${config.tableId}`
  scroller.classList.add('datatable_scroller')

  let current = Observable.from(data)

  const table = initTable(container, scroller, config, current)
  if (!table) return undefined

  // events
  container.addEventListener('scroll', function () {
    onScrollHandler(container, table, current, config)
  })
  container.addEventListener('wheel', (e) => onWheelHandler(e, container))
  container.addEventListener('keydown', (e) => onKeyDownHandler(e, container))

  if (config.fixedHeaders) {
    new ResizeObserver(() => updateShownheadersWidth(table, config)).observe(
      container
    )
  }

  // observable
  Observable.observe(current, (changes) =>
    observableChangesCallback(changes, table, config, container, current)
  )

  const result = {
    current,
    get table() {
      return table
    },
    get shown() {
      return current.slice(
        table.virtualConfig.firstRowIndex,
        table.virtualConfig.lastRowIndex
      )
    },
  }

  return new Proxy(result, {
    set: (target, prop, value, receiver) => {
      if (prop == 'current') {
        container.scrollTop = 0
        const transform = `translateY(0px)`
        table.table.style.setProperty('transform', transform)
        table.table.style.setProperty('WebkitTransform', transform)
        table.table.style.setProperty('MozTransform', transform)
        table.table.style.setProperty('OTransform', transform)
        table.table.style.setProperty('MsTransform', transform)

        setTimeout(() => {
          current = Observable.from(value)
          Observable.observe(current, (changes) =>
            observableChangesCallback(
              changes,
              table,
              config,
              container,
              current
            )
          )
          reDraw(current, table, container, config)
        }, 10)
      }
      return true
    },
  })
}
