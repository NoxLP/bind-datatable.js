import { sortCallback } from './tableOperations.js'

const SORT_ICONS = {
  '-1': {
    top: '&#9651',
    bottom: '&#9660',
  },
  1: {
    top: '&#9650',
    bottom: '&#9661',
  },
  2: {
    top: '&#9651',
    bottom: '&#9661',
  },
}

export const getHeaderKey = (h) => h.key ?? h.toLowerCase()

export const getHeaderKeyByIndex = (i, config) =>
  config.headers[i].key ?? config.headers[i].toLowerCase()

export const getConfigHeader = (col) => {
  let header = {}
  if ('title' in col && 'name' in col) {
    header.template = col.title
    header.key = col.name
  } else if ('title' in col) header = col.title
  else header = col.name

  return header
}

export const clickSortableHeaderCallback = (
  e,
  config,
  headerKey,
  currentData
) => {
  const topIcon = e.currentTarget.querySelector('.jdt-header-sort-top-icon')
  const bottomIcon = e.currentTarget.querySelector(
    '.jdt-header-sort-bottom-icon'
  )

  if (config.sortColumns[headerKey] == 2) {
    config.sortColumns[headerKey] = -1
    topIcon.style.visibility = 'hidden'
    bottomIcon.style.visibility = 'visible'
    bottomIcon.innerHTML = SORT_ICONS[-1].bottom
  } else if (config.sortColumns[headerKey] == -1) {
    config.sortColumns[headerKey] = 1
    topIcon.innerHTML = SORT_ICONS[1].top
    topIcon.style.visibility = 'visible'
    bottomIcon.style.visibility = 'hidden'
  } else {
    config.sortColumns[headerKey] = 2
    topIcon.innerHTML = SORT_ICONS[2].top
    bottomIcon.innerHTML = SORT_ICONS[2].bottom
    topIcon.style.visibility = 'visible'
    bottomIcon.style.visibility = 'visible'
  }
  currentData.sort((a, b) => sortCallback(a, b, config))
}
