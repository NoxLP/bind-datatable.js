import { ROW_HEIGHT_MODES } from "../virtual/virtual.js";

const buildTableKey = (table) => `pb-datatable-${table.table.id}`

export function saveScrollOnLocalStorage(scrollTop, table, config) {
  if (!table.table.id || table.table.id.length == 0) return

  const data = {
    scroll: scrollTop
  }
  if (config.rowHeightMode == ROW_HEIGHT_MODES[1]) // average
    data.firstShownRowIndex = table.virtualConfig.firstShownRowIndex

  localStorage.setItem(buildTableKey(table), JSON.stringify(data))
}

export function getScrollFromLocalStorage(table) {
  if (!table.table.id || table.table.id.length == 0) return null

  let data = localStorage.getItem(buildTableKey(table))
  if (data && data.length > 0) {
    data = JSON.parse(data)
    return data
  }

  return null
}