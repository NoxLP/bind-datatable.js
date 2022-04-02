export function Error(msg) {
  const err = `PB Datatable error: 
${msg}`
  console.error(err)
  alert(err)
}