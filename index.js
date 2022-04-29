import { DataTable } from "./src/datatable.js";

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
        h5: Math.floor(i + (Math.random() * 50)),
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

const testTable = new DataTable(
  dataObject(),
  {
    tableId: 'dtTest',
    rowHeightMode: 'average',
    containerSelector: '#table_container',
    headersClass: 'my-headers',
    headersStyle: 'color: white',
    headersRowClass: 'my-headers-row',
    headersRowStyle: 'height: 100px',
    headers: [
      { template: 'H1', key: 'h1' },
      { template: 'H2', key: 'h2' },
      { template: 'H3', key: 'h3' },
      { template: 'H4', key: 'h4' },
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
      // eslint-disable-next-line no-unused-vars
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
        style: () => `color: red;`
      },
      {
        cellEvents: [
          {
            name: () => 'click',
            callback: (reg, e) => {
              console.log('CLICK');
              console.log(e)
              alert(`${reg}
${JSON.stringify(e.target, null, 4)}`)
            }
          }
        ],
        width: 50
      },
      {
        template: (reg) => {
          return `<div style="min-height: ${Math.random() * 100}px">${reg}</div>`
        }
      },
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

window.testTable = testTable

document.getElementById("table_button").addEventListener('click', () => {
  console.log(testTable)
})

document.getElementById('test_button').addEventListener('click', () => {
  //testTable.current[0].h1 = 'bla'
  // console.log(testTable.current[0])
  //testTable.current[0] = { h1: 'foo', h2: 10, h3: 11, h4: 12 }
  /*testTable.current[1] = {
    h1: 'foo', h2: 2, h3: 3, h4: 4, h5: 5, h6: 6, h7: 7, h8: 8, h9: 9, h10: 10, h11: 11, h12: 12
  }*/
  /* const destructTest = [{
    h1: 'foo', h2: 2, h3: 3, h4: 4, h5: 5, h6: 6, h7: 7, h8: 8, h9: 9, h10: 10, h11: 11, h12: 12
  }]
  testTable.current = [...destructTest, ...testTable.current] */
  // console.log(testTable.current[0])
  // testTable.current[0].h2 = { more: [10, 'b'] }
  // testTable.current.push({ h1: 'a', h2: 'b', h3: 'c', h4: 'd' })
  // delete testTable.current[0].h3
  // console.log(testTable.current[0])
  //testTable.current.splice(1, 1)
  //testTable.current.sort((a, b) => a.h2 + b.h2)
  testTable.current.sort((a, b) => a.h5 - b.h5)
  console.log('FINISHED')
})
