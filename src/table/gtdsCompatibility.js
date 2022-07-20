import { Error } from '../error.js'

export const gtds_getDataByPrimaryKey = (current, indexesById, id) =>
  current[indexesById[id]]

export const gtds_updateDataByPrimaryKey = (
  current,
  indexesById,
  id,
  value
) => {
  current[indexesById[id]] = value
}
