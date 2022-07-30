export function DatatableError(msg) {
  const err = `
PB Datatable error: 
${msg}`
  console.error(err)
  throw new Error(err)
}
