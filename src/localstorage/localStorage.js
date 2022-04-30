const buildTableKey = (table) => `pb-datatable-${table.table.id}`

export function saveScrollOnLocalStorage(scrollTop, table) {
  if (!table.table.id || table.table.id.length == 0) return

  const data = JSON.stringify({
    scroll: scrollTop
  })

  localStorage.setItem(buildTableKey(table), data)
}

export function getScrollFromLocalStorage(table) {
  if (!table.table.id || table.table.id.length == 0) return null

  let data = localStorage.getItem(buildTableKey(table))
  if (data && data.length > 0) {
    data = JSON.parse(data)
    return data.scroll
  }

  return 0
}