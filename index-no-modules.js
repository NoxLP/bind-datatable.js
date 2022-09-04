// import { DataTable } from './src/datatable.js'

var data
var testTable
const filterInput = document.getElementById('filterInput')
filterInput.addEventListener('keyup', () => {
  testTable.filter()
})
;(async () => {
  var { DataTable } = await import('./src/datatable.js')
  const letters = 'abcdefghijklmnñopqrstuvwxyz'
  const getLetters = (j) => {
    const sj = `${j}`
    let value = ''
    for (let i = 0; i < sj.length; i++) {
      value += letters[sj[i]]
    }
    return value
  }
  const dataObject = () => {
    const result = []
    let j = 0
    for (let i = 0; i < 100000; i++) {
      // for (let i = 0; i < 50; i++) {
      if (i % 100 == 0) continue

      const reg = {
        id: i,
        h1: i,
        h2: ++j,
        h3: getLetters(j),
        h4: ++j,
        h5: Math.floor(i + Math.random() * (i / 2)),
        h6: ++j,
        h7: ++j,
        h8: ++j,
        h10: ++j,
        h11: ++j,
        h12: ++j,
        h13: ++j,
      }
      reg.h9 = getLetters(reg.h5)

      result.push(reg)
    }
    return result
  }

  data = dataObject()
  testTable = new DataTable([], {
    tableId: 'dtTest',
    // scrollBottomOffset: 10000,
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
    secondary: ['h2', 'h5'],
    // sort: (a, b) => b.id - a.id,
    /*rowsStyle: (reg, index) => {
        return `background-color: ${(index % 2 == 0 ? 'grey' : 'white')};`
      },*/
    rowsClass: (reg, index) =>
      (index % 2 != 0 ? 'my-rows-grey' : 'my-rows-white') + ' border-black',
    filter: (reg, index, logFilter) => {
      // if (logFilter) console.log('---- CONFIG FILTER: ', reg)
      return (
        // reg.h7 % 2 == 0 &&
        // (filterInput.value.length == 0 ||
        //   `${reg.h3}`.includes(filterInput.value))
        filterInput.value.length == 0 ||
        Object.values(reg).some((v) => `${v}`.includes(filterInput.value))
      )
    },
    columns: [
      {
        title: 'Prueba',
        name: 'prueba',
        template: (reg) => {
          return `${reg.id} - ${reg.h2}`
        },
        width: 100,
      },
      {
        title: 'H1',
        name: 'h1',
        template: (reg) => {
          return `<div style="background-color: lightgrey;border-radius: 5px;padding: 5px;">${reg.h1} T1</div>`
        },
        sort: 1,
      },
      {
        title: 'H2',
        name: 'h2',
        template: (reg) => {
          if (!reg.more) return reg.h2

          return `<div>${reg.more[0]} | ${reg.more[1]}</div>`
        },
        style: () => `color: red;`,
      },
      {
        title: 'H3',
        name: 'h3',
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
        //TODO: este width parece que afecta solo al header,
        // no al resto de la columna
        // width: 50,
        sort: 1,
      },
      {
        title: 'H4',
        name: 'h4',
        template: (reg) => {
          return `<div style="min-height: ${reg.h4 % 4 == 0 ? 20 : 80}px">${
            reg.h4
          }</div>`
        },
      },
      {
        title: 'H5',
        sort: 1,
      },
      { title: 'H6' },
      { title: 'H7' },
      { title: 'H8' },
      { title: 'H9' },
      { name: 'H10' },
      { name: 'H11' },
      { name: 'H12' },
      { name: 'H13' },
    ],
  })

  testTable.tableData(data)
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
