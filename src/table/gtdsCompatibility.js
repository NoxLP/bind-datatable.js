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

export const gtds_pushIndexId = (indexesById, current, config, value) => {
  if (!(`${config.id}` in value))
    Error(`New row needs a key with name ${config.id}`)
  if (`${value.id}` in indexesById.byIds)
    Error('Registry with same id already exists')
  indexesById.byIds[value.id] = current.length
  indexesById.byIndexes[current.length] = value.id
}

export const gtds_removeIndexId = (indexesById, index) => {
  const id = indexesById.byIndexes[index]
  delete indexesById.byIds[id]
  delete indexesById.byIndexes[index]
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
