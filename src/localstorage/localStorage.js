const buildTableKey = (table) => `pb-datatable-${table.table.id}`

export function saveScrollOnLocalStorage(scrollTop, table) {
  const data = JSON.stringify({
    scroll: scrollTop
  })

  localStorage.setItem(buildTableKey(table), data)
}

export function getScrollFromLocalStorage(table) {
  let data = localStorage.getItem(buildTableKey(table))
  if (data && data.length > 0) {
    data = JSON.parse(data)
    return data.scroll
  }
  return null
}