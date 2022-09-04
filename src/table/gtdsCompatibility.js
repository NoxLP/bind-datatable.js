import { DatatableError } from '../error.js'

export const gtds_getDataByPrimaryKey = (data, indexesById, id) => {
  if (!(id in indexesById.byIds)) {
    DatatableError(`Primary key ${id} not found in data`)
    return false
  }
  return data[indexesById.byIds[id]]
}

const gtds_getDataIndexesBySecondaryKey = (indexesById, id) => {
  if (!('secondaryByIds' in indexesById)) return false

  if (id in indexesById.secondaryByIds) return indexesById.secondaryByIds[id]

  return false
}

export const gtds_getDataBySecondaryKey = (
  data,
  indexesById,
  id,
  first = true
) => {
  const indexes = gtds_getDataIndexesBySecondaryKey(indexesById, id)
  if (!indexes) return false

  return first ? data[indexes[0]] : indexes.map((m) => data[m])
}

export const gtds_getPrimaryKeyBySecondaryKey = (
  config,
  data,
  indexesById,
  id,
  first = true
) => {
  const indexes = gtds_getDataIndexesBySecondaryKey(indexesById, id)
  if (!indexes) return false

  return first
    ? data[indexes[0]][config.rowId]
    : indexes.map((m) => data[m][config.rowId])
}

export const gtds_deleteRowByPrimaryKey = (data, indexesById, id) => {
  if (!(id in indexesById.byIds)) {
    DatatableError(`Primary key ${id} not found in data`)
    return false
  }

  data.splice(indexesById.byIds[id], 1)
}

export const gtds_updateDataByPrimaryKey = (
  data,
  config,
  indexesById,
  id,
  value
) => {
  if (!(id in indexesById.byIds)) {
    DatatableError(`Primary key ${id} not found in data`)
    return false
  }
  if (typeof value != 'object' || config.rowId in value) {
    DatatableError('Bad value to update register')
    return false
  }

  Object.entries(value).forEach(([key, propValue]) => {
    data[indexesById.byIds[id]][key] = propValue
  })
}

export const gtds_deleteRows = (proxiedResult) => {
  proxiedResult.data = []
}
