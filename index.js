import { DataTable } from "./src/model/data.js";

const table = new DataTable([
  [1, 2, 3, 4],
  [5, 6, 7, 8]
], {
  columns: [
    'H1', 'H2', 'H3', 'H4'
  ],
  containerSelector: '#table_container'
})