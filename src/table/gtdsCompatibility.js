import { DatatableError } from '../error.js'

export const gtds_getDataByPrimaryKey = (data, indexesById, id) =>
  data[indexesById.byIds[id]]

export const gtds_updateDataByPrimaryKey = (
  data,
  config,
  indexesById,
  id,
  value
) => {
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
