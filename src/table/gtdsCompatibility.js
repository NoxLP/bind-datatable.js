export const gtds_replaceIndexId = (indexesById, index, newId) => {
  const id = indexesById.byIndexes[index]
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
