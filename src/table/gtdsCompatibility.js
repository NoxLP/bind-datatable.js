import { DatatableError } from '../error.js'

export const gtds_getDataByPrimaryKey = (data, indexesById, id) => {
  if (!(id in indexesById.byIds)) {
    DatatableError(`Primary key ${id} not found in data`)
    return false
  }
  return data[indexesById.byIds[id]]
}

export const gtds_getDataBySecondaryKey = (
  data,
  indexesById,
  id,
  first = true
) => {
  if (!('secondaryByIds' in indexesById)) return false

  if (id in indexesById.secondaryByIds) {
    const indexes = indexesById.secondaryByIds[id]

    return first ? data[indexes[0]] : indexes.map((m) => data[m])
  }

  return false
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
  if (typeof value != 'object' || config.id in value) {
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
