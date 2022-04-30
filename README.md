# Data table config object:

| NAME                            | OPTIONAL / MANDATORY | VALUE                              | DEFAULT VALUE   | OTHER                             |
| ------------------------------- | -------------------- | ---------------------------------- | --------------- | --------------------------------- |
| tableId                         | optional             | -                                  | -               | -                                 |
| rowHeightMode                   | optional             | string: `[constant\|average\|all]` | `constant`      | -                                 |
| heightPrecalculationsRowsNumber | optional             | number                             | 200             | Ignored if row height is constant |
| virtualSafeRows                 | optional             | number                             | 10              | -                                 |
| rowsGutter                      | optional             | number                             | 0               | -                                 |
| lastRowBottomOffset             | optional             | number                             | row height \* 5 | -                                 |
| checkUpdatedRows                | optional             | boolean                            | true            | -                                 |
| fixedHeaders                    | optional             | boolean                            | true            | -                                 |
| showRowHeaders                  | optional             | boolean                            | false           | -                                 |
| colHeadersClass                 | optional             | string                             | -               | -                                 |
| colHeadersStyle                 | optional             | string                             | -               | -                                 |
| colHeadersRowClass              | optional             | string                             | -               | -                                 |
| colHeadersRowStyle              | optional             | string                             | -               | -                                 |
| rowHeaderClass                  | optional             | string                             | -               | -                                 |
| rowHeaderStyle                  | optional             | string                             | -               | -                                 |
| rows                            | optional             | ?                                  | -               | TODO                              |
| containerSelector               | mandatory            | string                             | -               | Table's container CSS selector    |
| headers                         | mandatory            | array                              | -               | See possible values below         |
| columns                         | mandatory            | array                              | -               | See possible values below         |

## Headers

Each element of the array can be one of the following two:

- string: column key will be the string with a toLowerCase
- object:

  | NAME     | OPTIONAL / MANDATORY | VALUE                     | OTHER                                                                                                |
  | -------- | -------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- |
  | template | mandatory            | function (`() => string`) | Callback that will return a string with the content of the header(html, text, whatever but a string) |
  | key      | mandatory            | string                    | -                                                                                                    |

## Columns

All the objects properties are optional, but the array needs at least one empty object per column.

| NAME       | VALUE                        | OTHER                                                                                                                                                                          |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| template   | function (`(reg) => string`) | Callback that will return a string with the content of the header(html, text, whatever but a string). The current data element will be provided as a parameter of the callback |
| style      | string                       | The string will be added to every cell style of this column                                                                                                                    |
| cellEvents | array of objects             | Events of the cells of this column: { name: name of the event, callback}                                                                                                       |
| width      | [number\|string]             | Will force the setted width to all cells of this column, regardless of other settings                                                                                          |
