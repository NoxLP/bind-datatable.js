// import { DataTable } from './src/datatable.js'

var data
var testTable
const filterInput = document.getElementById('filterInput')
filterInput.addEventListener('keyup', () => {
  testTable.filter()
})
;(async () => {
  var { DataTable } = await import('./src/datatable.js')
  const dataObject = () => {
    const result = []
    let j = 0
    for (let i = 0; i < 100000; i++) {
      if (i % 100 == 0) continue
      result.push({
        id: i,
        h1: i,
        h2: ++j,
        h3: ++j,
        h4: ++j,
        h5: Math.floor(i + Math.random() * 50),
        h6: ++j,
        h7: ++j,
        h8: ++j,
        h9: i,
        h10: ++j,
        h11: ++j,
        h12: ++j,
      })
    }
    return result
  }

  data = dataObject()
  testTable = new DataTable(data, {
    tableId: 'dtTest',
    rowHeightMode: 'average',
    containerSelector: '#table_container',
    showRowHeaders: true,
    colHeadersClass: 'my-headers',
    colHeadersStyle: 'color: white',
    colHeadersRowClass: 'my-headers-row',
    colHeadersRowStyle: 'height: 100px',
    rowHeaderClass: 'my-headers-row',
    rowHeaderStyle: 'color: white',
    saveScroll: true,
    selectRows: true,
    multipleSelection: true,
    sort: (a, b) => b.id - a.id,
    /*rowsStyle: (reg, index) => {
        return `background-color: ${(index % 2 == 0 ? 'grey' : 'white')};`
      },*/
    rowsClass: (reg, index) =>
      (index % 2 != 0 ? 'my-rows-grey' : 'my-rows-white') + ' border-black',
    filter: (reg, index) => {
      // if (logFilter) console.log(reg)
      return (
        reg.h7 % 2 == 0 &&
        (filterInput.value.length == 0 ||
          `${reg.h3}`.includes(filterInput.value))
      )
    },
    columns: [
      {
        title: 'Prueba',
        key: 'prueba',
        template: (reg) => {
          return `${reg.id} - ${reg.h2}`
        },
        width: 100,
      },
      {
        title: 'H1',
        key: 'h1',
        template: (reg) => {
          return `<div style="background-color: lightgrey;border-radius: 5px;padding: 5px;">${reg.h1} T1</div>`
        },
      },
      {
        title: 'H2',
        key: 'h2',
        template: (reg) => {
          if (!reg.more) return reg.h2

          return `<div>${reg.more[0]} | ${reg.more[1]}</div>`
        },
        style: () => `color: red;`,
      },
      {
        title: 'H3',
        key: 'h3',
        cellEvents: [
          {
            name: () => 'click',
            callback: (reg, e) => {
              console.log('CLICK')
              console.log(e)
              alert(`${reg.h3}
  ${JSON.stringify(e.target, null, 4)}`)
            },
          },
        ],
        width: 50,
      },
      {
        title: 'H4',
        key: 'h4',
        template: (reg) => {
          return `<div style="min-height: ${Math.random() * 100}px">${
            reg.h4
          }</div>`
        },
      },
      {
        title: 'H5',
      },
      { title: 'H5' },
      { title: 'H6' },
      { title: 'H7' },
      { title: 'H8' },
      { key: 'H9' },
      { key: 'H10' },
      { key: 'H11' },
      { key: 'H12' },
    ],
  })
})()

document.getElementById('table_button').addEventListener('click', () => {
  console.log(testTable)
})

document.getElementById('scroll_button').addEventListener('click', () => {
  console.log(document.getElementById('table_container').scrollTop)
})

document.getElementById('test_button').addEventListener('click', () => {
  testTable.data[0].h1 = 'bla'
  // console.log(testTable.current[0])
  //testTable.current[0] = { h1: 'foo', h2: 10, h3: 11, h4: 12 }
  testTable.current[1] = {
    id: 100000,
    h1: 'foo',
    h2: 2,
    h3: 3,
    h4: 4,
    h5: 5,
    h6: 6,
    h7: 7,
    h8: 8,
    h9: 9,
    h10: 10,
    h11: 11,
    h12: 12,
  }
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
  testTable.data.sort((a, b) => a.h5 - b.h5)
  testTable.data[0].h1 = 'bla'
  console.log('FINISHED')
})
