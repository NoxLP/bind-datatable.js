import { Error } from '../error.js'
export const gtds_replaceIndexId = (indexesById, index, newId) => {
  if (typeof newId != 'string' && typeof newId != 'number')
    Error("Updated id to a value that wasn't a string nor a number")

  const id = indexesById.byIndexes[index]
  newId = `${newId}`
  delete indexesById.byIds[id]
  delete indexesById.byIndexes[index]
  indexesById.byIds[newId] = index
  indexesById.byIndexes[index] = newId
}

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
