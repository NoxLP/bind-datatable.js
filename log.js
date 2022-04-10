export function logScroll(table) {
  const container = document.getElementById('table_container')
  const domRows = document.querySelector('#table_container div table').children

  const firstTdText = domRows[1].children[0].innerHTML
  const lastTdText = domRows[domRows.length - 1].children[0].innerHTML
  if (firstTdText == table.virtualConfig.firstShownRowIndex
    && lastTdText == table.virtualConfig.lastShownRowIndex
  ) {
    console.log('CORRECT')
    console.log(`> First row: ${firstTdText} / ${table.virtualConfig.firstShownRowIndex}`)
    console.log(`> last row: ${lastTdText} / ${table.virtualConfig.lastShownRowIndex}`);
  } else {
    console.log('INCORRECT')
    console.log(`> First row: ${firstTdText} / ${table.virtualConfig.firstShownRowIndex}`)
    console.log(`> last row: ${lastTdText} / ${table.virtualConfig.lastShownRowIndex}`);
  }
}