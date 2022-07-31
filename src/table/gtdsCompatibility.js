import { DatatableError } from '../error.js'

export const gtds_getDataByPrimaryKey = (data, indexesById, id) =>
  data[indexesById.byIds[id]]

export const gtds_updateDataByPrimaryKey = (data, indexesById, id, value) => {
  data[indexesById.byIds[id]] = value
}

export const gtds_deleteRows = (proxiedResult) => {
  proxiedResult.data = []
}
