import { DatatableError } from './error.js'
import { buildHeaderId, initTable, reDraw } from './table/init.js'
import {
  isSortFunctionValid,
  sortCallback,
  clickSortableHeaderCallback,
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
import {
  gtds_getDataByPrimaryKey,
  gtds_updateDataByPrimaryKey,
  gtds_deleteRows,
} from './table/gtdsCompatibility.js'

let lastDatatableId = 0

const buildIndexesById = (data, config) => {
  return data.reduce(
    (acc, reg, idx) => {
      acc.byIds[reg[config.id]] = idx
      acc.byIndexes[idx] = reg[config.id]
      return acc
    },
    { byIds: {}, byIndexes: {} }
  )
}
const replaceIndexId = (indexesById, index, newId) => {
  if (typeof newId != 'string' && typeof newId != 'number')
    DatatableError("Updated id to a value that wasn't a string nor a number")

  const id = indexesById.byIndexes[index]
  newId = `${newId}`
  delete indexesById.byIds[id]
  delete indexesById.byIndexes[index]
  indexesById.byIds[newId] = index
  indexesById.byIndexes[index] = newId
}
const pushIndexId = (indexesById, current, config, value) => {
  if (!(`${config.id}` in value))
    DatatableError(`New row needs a key with name ${config.id}`)
  if (`${value.id}` in indexesById.byIds)
    DatatableError('Registry with same id already exists')
  indexesById.byIds[value.id] = current.length
  indexesById.byIndexes[current.length] = value.id
}
const removeIndexId = (indexesById, index) => {
  const id = indexesById.byIndexes[index]
  delete indexesById.byIds[id]
  delete indexesById.byIndexes[index]
}

const getColIndexKey = (change, config) =>
  !/^\d+$/.test(change.path[1])
    ? config.headers.findIndex((h) => h.key == change.path[1])
    : change.path[1]

const isTableSorted = (config) =>
  (config.sortColumns &&
    Array.isArray(config.sortColumns) &&
    config.sortColumns.length > 0) ||
  isSortFunctionValid(config)

const insertChange = (
  indexesById,
  current,
  config,
  change,
  table,
  container
) => {
  pushIndexId(indexesById, current, config, change.value)

  if (
    current.length == 0 ||
    table.virtualConfig.rowHeight == 0 ||
    (table.virtualConfig.firstRowIndex < change.path &&
      (table.virtualConfig.lastRowIndex > change.path ||
        table.virtualConfig.lastRowIndex == current.length - 1))
  ) {
    const rowTuplet = createRow(
      parseInt(change.path[0]),
      change.value,
      config,
      table
    )

    table.tableBody.appendChild(rowTuplet.row)
    table.rows.push(rowTuplet)

    if (current.length == 0 || table.virtualConfig.rowHeight == 0)
      updateShownheadersWidth(table, config)

    checkScroll(container, table, current, config)
  }

  if (isTableSorted(config)) current.sort((a, b) => sortCallback(a, b, config))
}

const observableChangesCallback = (
  changes,
  table,
  config,
  container,
  current,
  indexesById
) => {
  changes.forEach((change) => {
    // change.path have an ordered full path to the updated property
    // f.i.: [0,'h1'] would be data[0][h1]

    let updated = table.rows.find((r) => r.dataIndex == change.path[0])
    const isCellChanged = change.path.length > 1

    switch (change.type) {
      case 'update':
        console.log(change)
        console.log('UED ', updated)
        if (isCellChanged) {
          // cell updated
          if (!updated) break

          updated = updated.cells[change.path[1]]
          const col = getColIndexKey(change, config)

          if (change.path[1] == config.id)
            replaceIndexId(indexesById, change.path[0], change.value[config.id])
          else updateCell(updated, config.columns[col], change.value)

          updateShownheadersWidth(table, config)
        } else if (parseInt(change.path[0]) > current.length - 1) {
          // inserted new value via data[index] with index not in the array
          insertChange(indexesById, current, config, change, table, container)
        } else {
          // complete row updated
          if (!updated) break

          if (
            config.checkUpdatedRows &&
            !checkRowKeys(change.value, config.headers)
          ) {
            DatatableError(`New value while trying to update row wasn't correct.
Some headers may be incorrect: 
${JSON.stringify(change.value, null, 4)}`)
          } else {
            replaceIndexId(indexesById, change.path[0], change.value[config.id])
            updateRow(updated.row, updated.dataIndex, change.value, config)
          }
        }

        if (isTableSorted(config))
          current.sort((a, b) => sortCallback(a, b, config))

        updateShownheadersWidth(table, config)

        break
      case 'insert':
        if (isCellChanged) {
          DatatableError('Can not add a new cell')
          return
        }

        insertChange(indexesById, current, config, change, table, container)

        break
      case 'delete':
        if (isCellChanged) {
          updated = updated.cells[change.path[1]]
          const col = getColIndexKey(change, config)

          if (change.path[1] == config.id) DatatableError("Can't remove id")
          else updated.replaceWith(updateCell(updated, config.columns[col], ''))
        } else if (
          table.virtualConfig.firstRowIndex < change.path &&
          (table.virtualConfig.lastRowIndex > change.path ||
            table.virtualConfig.lastRowIndex == current.length - 1) &&
          updated
        ) {
          removeIndexId(indexesById, change.path[1])
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
            if (row)
              updateRow(row.row, row.dataIndex, current[row.dataIndex], config)
          }

          indexesById.byIds = {}
          indexesById.byIndexes = {}
          current.forEach((reg, idx) => {
            indexesById.byIds[reg[config.id]] = idx
            indexesById.byIndexes[idx] = reg[config.id]
          })
          checkScroll(container, table, current, config, virtualConfig)
        }

        break
    }
  })
}

const getConfigHeader = (col) => {
  let header = {}
  if ('title' in col && 'name' in col) {
    header.template = col.title
    header.key = col.name
  } else if ('title' in col) header = col.title
  else header = col.name

  return header
}

const checkConfigAndSetDefaults = (config) => {
  // Check config is correct and set defaults
  if (
    !config ||
    !('containerSelector' in config) ||
    !('columns' in config) ||
    config.columns.some((col) => !('name' in col) && !('title' in col))
  ) {
    const msg = 'Bad config object. Check mandatory options'
    DatatableError(msg)
    return undefined
  }

  config.headers = []

  let saveSort = false
  config.columns.forEach((col) => {
    let header = getConfigHeader(col)
    config.headers.push(header)

    if (col.sort) {
      if (!saveSort) saveSort = true
      if (!config.sortColumns) config.sortColumns = {}

      config.sortColumns[header.key] = 2
    }
  })

  if (!config.primary || typeof config.primary != 'string') config.id = 'id'
  else {
    config.id = config.primary
    delete config.primary
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

  if ('tableId' in config && typeof config.tableId != 'string')
    config.tableId = `${config.tableId}`
  else if (!('tableId' in config)) config.tableId = `jdt_${++lastDatatableId}`

  if (!('virtualSafeRows' in config)) config.virtualSafeRows = 10

  if (!('rowsGutter' in config)) config.rowsGutter = 0

  if (!('fixedHeaders' in config)) config.fixedHeaders = true

  if (!('selectRows' in config)) config.selectRows = true

  if (!('selectedRowClass' in config))
    config.selectedRowClass = 'jdt-datatable-selected-row'

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
    DatatableError(
      'Found 0 or multiple table containers. Table need at least and only one container.'
    )
  const container = containers[0]
  container.setAttribute('tabIndex', 1)
  const scroller = document.createElement('div')
  if ('tableId' in config) scroller.id = `datatable_scroller_${config.tableId}`
  scroller.classList.add('datatable_scroller')

  let current, table, proxiedResult, result
  let filteredData = data

  //filter
  if ('filter' in config && typeof config.filter != 'function')
    filteredData = data.filter((reg, idx) => config.filter(reg, idx))

  //sort
  if (isTableSorted(config))
    filteredData.sort((a, b) => sortCallback(a, b, config))

  //current
  current = Observable.from(filteredData)

  table = initTable(container, scroller, config, current)
  if (!table) return undefined

  // events
  // when container.scrollTop change
  container.addEventListener('scroll', () => {
    onScrollHandler(container, table, current, config)
  })
  // when mouse wheel change
  container.addEventListener('wheel', (e) => {
    onWheelHandler(e, container)
  })
  // key down
  container.addEventListener('keydown', (e) => {
    onKeyDownHandler(e, container, table)
  })
  // sortable columns header click
  setTimeout(() => {
    config.columns.forEach((col) => {
      if (!col.sort) return

      const header = getConfigHeader(col)
      const headerKey = header.key ?? header.toLowerCase()
      const headerId = buildHeaderId(config, headerKey)
      document
        .getElementById(headerId + '_sortButton')
        .addEventListener('click', (e) => {
          clickSortableHeaderCallback(e, config, headerKey, result.data)
        })
    })
  }, 20)

  if (config.fixedHeaders) {
    new ResizeObserver(() => updateShownheadersWidth(table, config)).observe(
      container
    )
  }

  table.indexesById = buildIndexesById(data, config)

  // observable
  Observable.observe(current, (changes) =>
    observableChangesCallback(
      changes,
      table,
      config,
      container,
      current,
      table.indexesById
    )
  )

  result = {
    data: current,
    table,
    sort: config.sort,
    filter: (log) => {
      if (!('filter' in config) || typeof config.filter != 'function') return
      config.filtered = true
      proxiedResult.data = data.filter(config.filter)
    },
    get shown() {
      return current.slice(
        table.virtualConfig.firstRowIndex,
        table.virtualConfig.lastRowIndex + 1
      )
    },
    get indexesById() {
      return table.indexesById
    },
    tableData: (tableData) => {
      data = tableData
      proxiedResult.data = tableData
    },
    getDataByPrimaryKey: (id) =>
      gtds_getDataByPrimaryKey(proxiedResult.data, table.indexesById, id),
    updateDataByPrimaryKey: (id, value) =>
      gtds_updateDataByPrimaryKey(
        proxiedResult.data,
        config,
        table.indexesById,
        id,
        value
      ),
    deleteRows: () => gtds_deleteRows(proxiedResult),
    reDraw: () => reDraw(proxiedResult.data, table, container, config),
  }

  if (config.selectRows) {
    if (!config.multipleSelection) {
      Object.defineProperty(result, 'selectedRow', {
        get() {
          return result.table.selectedRow
        },
      })
    } else {
      result.table.selectedRows = []
      Object.defineProperty(result, 'selectedRows', {
        get() {
          return result.table.selectedRows
        },
      })
    }
  }

  proxiedResult = new Proxy(result, {
    set: (target, prop, value, receiver) => {
      if (target.scriptChange) return false
      if (prop == 'data') {
        container.scrollTop = 0
        const transform = `translateY(0px)`
        table.table.style.setProperty('transform', transform)
        table.table.style.setProperty('WebkitTransform', transform)
        table.table.style.setProperty('MozTransform', transform)
        table.table.style.setProperty('OTransform', transform)
        table.table.style.setProperty('MsTransform', transform)

        setTimeout(() => {
          target.scriptChange = true

          if (config.filtered) delete config.filtered
          else if ('filter' in config && typeof config.filter == 'function') {
            value = value.filter((reg, idx) => config.filter(reg, idx))
          }

          if (isTableSorted(config)) {
            value.sort((a, b) => sortCallback(a, b, config))
          }

          current = Observable.from(value)
          result.data = current
          table.indexesById = buildIndexesById(result.data, config)

          Observable.observe(result.data, (changes) =>
            observableChangesCallback(
              changes,
              table,
              config,
              container,
              current,
              table.indexesById
            )
          )
          reDraw(current, table, container, config)

          delete target.scriptChange
        }, 10)
      } else if (prop == 'sort') {
        if (!value || typeof value != 'function') {
          DatatableError(
            'Sort value must be a compare function like native sort callback'
          )
          return false
        }

        config.sort = value
        current.sort((a, b) => sortCallback(a, b, config))
      }
      return true
    },
  })

  return proxiedResult
}
