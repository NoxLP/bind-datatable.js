import { Error } from "../error.js";
import { initTable } from "../view/table.js";
import { clone } from "../helpers/clone.js";

/**
 * 
 * @param {object} data Data registers array
 * @param {object} config Config object:
 * {
 *   containerSelector,
 *   columns,
 *   headers
 * }
 * @returns 
 */
export function DataTable(data, config) {
  const original = data
  let current = clone(data)
  let shown = current

  const containers = document.querySelectorAll(config.containerSelector)
  if (!containers || containers.length > 1)
    Error('Found 0 or multiple table containers. Table need at least and only one container.')
  const container = containers[0]

  const table = initTable(container, config.headers, config.columns, original)
  if (!table) return undefined

  return new Proxy(this, {
    get(target, prop, receiver) {
      console.log('>>> TOP');
      console.log(target)
      console.log(prop)
      console.log('END TOP <<<');
      switch (prop) {
        case 'originalData':
          return new Proxy(original, {
            get(target, prop) {
              return (clone(original))[prop]
            },
            set() { }
          })
        case 'currentData':
          return new Proxy(current, {
            get(target, prop, receiver) {

            },
            set(target, prop, receiver) {
            }
          })
        case 'shownData':
          return new Proxy(shown, {
            get(target, prop, receiver) {

            },
            set(target, prop, receiver) {
            }
          })
        default:
          return undefined
      }
    },
  })
}