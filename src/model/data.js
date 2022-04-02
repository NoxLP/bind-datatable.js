import { Error } from "../error.js";
import { initTable } from "../view/table.js";

/**
 * 
 * @param {object} data Data registers array
 * @param {object} config Config object:
 * {
 *   containerSelector,
 *   columns,
 * }
 * @returns 
 */
export function DataTable(data, config) {
  const original = data
  const current = data
  const shown = data

  const containers = document.querySelectorAll(config.containerSelector)
  if (!containers || containers.length > 1)
    Error('Found 0 or multiple table containers. Table need at least and only one container.')
  const container = containers[0]

  const table = initTable(container, config.columns, original)
  if (!table) return undefined

  return {
    originalData: new Proxy(original, {
      get(target, prop, receiver) {

      },
      set() { }
    }),
    currentData: new Proxy(current, {
      get(target, prop, receiver) {

      },
      set(target, prop, receiver) {
      }
    }),
    shownData: new Proxy(shown, {
      get(target, prop, receiver) {

      },
      set(target, prop, receiver) {
      }
    })
  }
}