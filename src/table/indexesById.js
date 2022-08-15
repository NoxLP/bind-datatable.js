import { DatatableError } from '../error.js'

const getSecondaryIndexById = (config, acc, reg, idx) => {
  config.secondary.forEach((key) => {
    if (key in reg) {
      const id = reg[key]
      if (id in acc.secondaryByIds) {
        if (!acc.secondaryByIds[id].includes(idx))
          acc.secondaryByIds[id].push(idx)
      } else {
        acc.secondaryByIds[id] = [idx]
      }
    }
  })
}

export const buildIndexesById = (data, config) => {
  const initialObject = { byIds: {}, byIndexes: {} }
  let getSecondaryIndexByIdIfNeeded = () => {}
  if (config.secondary) {
    initialObject.secondaryByIds = {}
    getSecondaryIndexByIdIfNeeded = getSecondaryIndexById
  }

  return data.reduce((acc, reg, idx) => {
    acc.byIds[reg[config.id]] = idx
    acc.byIndexes[idx] = reg[config.id]

    getSecondaryIndexByIdIfNeeded(config, acc, reg, idx)
    return acc
  }, initialObject)
}
export const replaceIndexId = (indexesById, index, newId) => {
  if (typeof newId != 'string' && typeof newId != 'number')
    DatatableError("Updated id to a value that wasn't a string nor a number")

  const id = indexesById.byIndexes[index]
  newId = `${newId}`
  delete indexesById.byIds[id]
  delete indexesById.byIndexes[index]
  indexesById.byIds[newId] = index
  indexesById.byIndexes[index] = newId
}
export const pushIndexId = (indexesById, current, config, value) => {
  if (!(`${config.id}` in value))
    DatatableError(`New row needs a key with name ${config.id}`)
  if (`${value.id}` in indexesById.byIds)
    DatatableError('Registry with same id already exists')
  indexesById.byIds[value.id] = current.length
  indexesById.byIndexes[current.length] = value.id
}
export const removeIndexId = (indexesById, index) => {
  const id = indexesById.byIndexes[index]
  delete indexesById.byIds[id]
  delete indexesById.byIndexes[index]
}
