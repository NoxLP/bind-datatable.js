import { DataTable } from "./src/model/data.js";

const table = new DataTable([
  [1, 2, 3, 4],
  [5, 6, 7, 8]
], {
  containerSelector: '#table_container',
  headers: [
    'H1', 'H2', 'H3', 'H4'
  ],
  columns: [
    {
      template: (reg) => {
        return `<div style="background-color: lightgrey;border-radius: 5px;padding: 5px;">${reg} T1</div>`
      }
    },
    {
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
  ]
})