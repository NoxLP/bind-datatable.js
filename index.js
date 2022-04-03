import { DataTable } from "./src/model/data.js";

const table = new DataTable(
  [
    {
      h1: 1,
      h2: 2,
      h3: 3,
      h4: 4,
    },
    {
      h1: 5,
      h2: 6,
      h3: 7,
      h4: 8,
    }
  ],
  {
    containerSelector: '#table_container',
    headers: [
      { content: 'H1', key: 'h1' }, { content: 'H2', key: 'h2' }, { content: 'H3', key: 'h3' }, { content: 'H4', key: 'h4' }, 'H5'
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
      {}
    ]
  })

table.current[0].h1 = 'bla'
console.log(table.current[0])
table.current[0] = { h1: 'foo', h2: 10, h3: 11, h4: 12 }
console.log(table.current[0])
table.current[0].h2 = { more: [10, 'b'] }
