import { DataTable } from "./src/model/data.js";
import { viewportDataWithDifferentHeights, viewportDataWithConstantHeight } from "./src/virtual/virtual.js";

const dataObject = () => {
  const result = []
  let j = 0
  for (let i = 0; i < 100000; i++) {
    result.push(
      {
        h1: i,
        h2: ++j,
        h3: ++j,
        h4: ++j,
        h5: i,
        h6: ++j,
        h7: ++j,
        h8: ++j,
        h9: i,
        h10: ++j,
        h11: ++j,
        h12: ++j,
      },
    )
  }
  return result
}

const table = new DataTable(
  dataObject(),
  {
    containerSelector: '#table_container',
    headers: [
      { content: 'H1', key: 'h1' },
      { content: 'H2', key: 'h2' },
      { content: 'H3', key: 'h3' },
      { content: 'H4', key: 'h4' },
      'H5',
      'H6',
      'H7',
      'H8',
      'H9',
      'H10',
      'H11',
      'H12',
    ],
    rows: {
      template: (row) => { }
    },
    columns: [
      {
        template: (reg) => {
          return `<div style="background-color: lightgrey;border-radius: 5px;padding: 5px;">${reg} T1</div>`
        }
      },
      {
        template: (reg) => {
          if (!reg.more) return reg

          return `<div>${reg.more[0]} | ${reg.more[1]}</div>`
        },
        style: (reg) => `color: red;`
      },
      {
        cellEvents: [
          {
            name: (reg) => 'click',
            callback: (reg, e) => {
              console.log('CLICK');
              console.log(e)
              alert(`${reg}
${JSON.stringify(e.target, null, 4)}`)
            }
          }
        ]
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ]
  })

document.getElementById("viewport_button").addEventListener('click', () => {
  console.log(viewportDataWithConstantHeight(
    document.getElementById('table_container'),
    table.table.rows,
  ))
})

let currentIndex = 0
document.getElementById("table_button").addEventListener('click', () => {
  console.log(table)
})

/* table.current[0].h1 = 'bla'
console.log(table.current[0])
table.current[0] = { h1: 'foo', h2: 10, h3: 11, h4: 12 }
console.log(table.current[0])
table.current[0].h2 = { more: [10, 'b'] }
table.current.push({ h1: 'a', h2: 'b', h3: 'c', h4: 'd' })
delete table.current[0].h3
console.log(table.current[0]) */

