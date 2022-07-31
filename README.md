# ESPAÑOL

Tabla que usa proxies anidados([Observable](https://github.com/gullerya/object-observer)) para registrar los cambios en un array de datos y reflejarlos automáticamente en el `DOM`.

<br>

# Uso:

En los archivos `index-modules.js` e `index-no-modules.js` hay sendos ejemplos de uso.

<br>

- Crea una variable con la tabla:
    ```javascript
    const testTable = new DataTable(data, configObjet)
    ```

- La tabla espera que los datos(`data`) vengan en un array de objetos, donde cada elemento del array sea un objeto de `Javascript`.

- El objeto de configuración está descrito más abajo. Un ejemplo con las propiedades mínimas requeridas podría ser el siguiente:
    ```javascript
    {
      containerSelector: '#table_container',
      headers: [
        { template: 'H1', key: 'h1' },
        { template: 'H2', key: 'h2' },
        'H3'
      ],
      columns: [
        {
          template: (reg) => {
            return `<div style="background-color: lightgrey;border-radius: 5px;padding: 5px;">${reg} T1</div>`
          },
        },
        {
          template: (reg) => {
            if (!reg.more) return reg

            return `<div>${reg.more[0]} | ${reg.more[1]}</div>`
          },
          style: () => `color: red;`,
        },
        {},
      ]
    })
    ```
- `testTable` es un objeto con las propiedades:
    - `data`: Para realizar cambios en los datos que se vean reflejados en la tabla, hay que usar `data` o `shown`(ver más abajo):
    
    ```javascript
    testTable.data[482].h1 = 'foo'
    ```

    - `table`: Contiene varios elementos del `DOM` que conforman la tabla, y la información del scroll virtual.
    
      Se provee para que pueda accederse a los estilos y clases de los elementos, NO para modificar los datos.
      TODO: ¿Quizás esto no debería pasarse a menos que se habilitara alguna opción de debug?

    - `filter`: Es una función sin parámetros que vuelve a aplicar los filtros establecidos en el objeto de configuración. Cuando los valores de filtrado cambien, hay que llamar a este función, por ejemplo:

    ```javascript
    const filterInput = document.getElementById('filterInput')
    filterInput.addEventListener('keyup', () => {
      testTable.filter()
    })
    ```

    - `sort`: Es la función de comparación que se usa en la ordenación automática. 
      Además de afectar de manera automática al orden de los datos, cuando se cambia la función se reordenan los datos.

    - `shown`: Contiene los registros de los datos que la tabla carga actualmente en el `DOM`, incluyendo las filas seguras. No se provee los datos originales, sino los proxies, de forma que se pueden cambiar los datos directamente usando esta propiedad igual que con `data`.

    - `indexesById`: Si los datos contienen un campo `id` o se ha especificado otro campo en el objeto de configuración, registra qué índice de los datos corresponde a cada id y viceversa, con la intención de acceder a los datos más rápidamente, sin tener que recorrer el array de datos.

    - `selectedRow` | `selectedRows`: Dependiende de si la selección múltiple de filas está activada o desactivada, devuelve un objeto o un array de objetos, con información sobre la/s fila/s seleccionada/s. 
    
      Los objetos se corresponden con los que se pueden observar en `testTable.table.rows`. Los objetos

      Los objetos están ordenados según el orden en que fueron seleccionados/deseleccionados, NO por id ni el índice de los datos.
    
    - `tableData`: Función para asignar nuevos datos a la tabla.
    
      Los nuevos datos sobreescribirán por completo los anteriores, manteniendo el filtrado y el orden ya asignado.
    
<br>

# Objecto de configuración:

| NOMBRE                            | OPCIONAL / OBLIGATORIO | VALOR                  | DEFAULT   | DESCRIPCIÓN | OTROS                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------- | -------------------- | ---------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |---|
| tableId                         | optional             | -                      | -              | Dentro del container se crean dos tablas, una para los headers con id "`${tableId}Headers`" y otra para las filas con id "`${tableId}`" | Si no es una `string`, será convertida mediante interpolación (`${config.tableId}`)                                                                                                                                                                                                                                                                                                                                                                                                                     |
| rowHeightMode                   | optional             | string enum            | `'constant'`    | Modo de calcular el alto de las filas para la virtualización | Posibles valores debajo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| heightPrecalculationsRowsNumber | optional             | number                 | 200             | Ver apartado de `rowHeightMode` más abajo | Será ignorado según el valor de `rowHeightMode`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| virtualSafeRows                 | optional             | number                 | 10              | Número de filas que se calculan por encima Y por debajo de las mínimas necesarias |-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| rowsGutter                      | optional             | number                 | 0               | TODO: espacio entre filas | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| lastRowBottomOffset             | optional             | number                 | row height \* 5 | Espacio entre la última fila y el final de la tabla | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| scrollBottomOffset | optional | number | 1000 | Cuando ocurre un scroll "hacia abajo"(`deltaY > 0` para la rueda del ratón, o cuando se presionan las teclas `'ArrowDown'` o `'PageDown'`), si el scroll es >= que `alto total - scrollBottomOffset`, el scroll de la tabla se setea directamente al máximo posible | - 
| checkUpdatedRows                | optional             | boolean                | true            | Fuerza un chequeo de la fila antes de actualizar: :heavy_check_mark: Número de columnas igual al de la tabla; :heavy_check_mark: Todas las keys y su orden igual al de la tabla | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| fixedHeaders                    | optional             | boolean                | true            | Mantiene el ancho de cada header igualado al ancho máximo de las celdas visibles |-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| showRowHeaders                  | optional             | boolean                | false           | Muestra un header para las filas con el índice de la fila |-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| colHeadersClass                 | optional             | string                 | -               | Clase css para los `th` de los headers de las columnas |-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| colHeadersStyle                 | optional             | string                 | -               | Estilos css para los`th` de los headers de las columnas |-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| colHeadersRowClass              | optional             | string                 | -               | Clase css para los `tr` de los headers de las columnas |-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| colHeadersRowStyle              | optional             | string                 | -               | Estilos css para los `tr` de los headers de las columnas |-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| rowHeaderClass                  | optional             | string                 | -               | Clase css para los `th` de los headers de las filas |-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| rowHeaderStyle                  | optional             | string                 | -               | Estilos css para los `th` de los headers de las columnas |-                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| rowsStyle                       | optional             | (reg, index) => string | -               | Estilos css para las filas | Callback que retorna una `string` con el estilo de la fila. Como parámetros se proveen el dato actual que se está calculando(reg) y su índice en los datos(index)                                                                                                                                                                                                                                                                                                                                                                                    |
| rowsClass                       | optional             | (reg, index) => string | -               | Clase para las filas | Callback que retorna una `string` con el estilo de la fila. Como parámetros se proveen el dato actual que se está calculando(reg) y su índice en los datos(index). La `string` devuelta será asignada directamente tal cual por medio de `className`(sobreescribe la clase)                                                                                                                                                                                                                                                                                                                                         |
| saveScroll                      | optional             | boolean                | false           | Guarda el último scroll en localStorage y lo recarga con la página | Cuidado, se usa el atributo `id` de la tabla como key para el `localStorage`. Si por cualquier razón la id cambia(entre versiones, por ejemplo), NO limpiará la key vieja y no recogerá los datos antiguos. Si a la tabla no se le asigna una id, falla sin lanzar error. Además, si se está usando el `rowHeightMode` como `average`, tiene un error que usualmente es de +-2 filas |
| containerSelector               | mandatory            | string                 | -               | Selector CSS del eemento del DOM que actua como contenedor de la tabla | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| filter | optional | function | - | Filtro a aplicar a cada registro | El filtro se aplica cada vez que la tabla se carga, y cada vez que se llama a la función `filter` |
| selectRows | optional | boolean | true | Se pueden seleccionar las filas | - |
| multipleSelection | optional | boolean | false | Pueden existir varias filas seleccionadas al mismo tiempo | - |
| selectedRowClass | optional | string | `datatable-selected-row` | Clase que se aplica al `tr` de las filas seleccionadas | - |
| sort | optional | function | - | Función callback que se aplica en la ordenación automática | Se proveen dos registros como parámetros, igual que el callback del `sort` nativo |
| columns                         | mandatory            | array                  | -               | Configuración de columnas | Ver valores abajo                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

---

<br>
  
## Row height mode

Para virtualizar los datos se necesita el alto de las filas, el valor de la propiedad determina cómo se calcula:

`[constant|function|average|all]`

- `'constant'`: Todas las filas serán tratadas como si tuvieran el mismo alto, que será calculado creando en el DOM la primera fila y usando su atributo `clientHeight`. 
  Este es el modo más liviano en términos de rendimiento.

El resto es para tablas con filas de alto dinámico:

- `'function'`: Al crear la tabla, se espera que la propiedad `rowHeightFunction` de `config`, sea una función que devuelva un valor numérico para cada fila, que será usado como alto de dicha fila.
  Ten en cuenta que la función únicamente recivirá el dato original como parámetro, NO el elemento DOM de la fila, y será calculado cada vez que los datos cambien, así que es cosa tuya cómo de preciso será el cálculo y cuánto tardará en hacerse.
- `'average'`: Se calculará una media aritmética de los altos de las filas al crearse la tabla(normalmente cada vez que la página se cargue). Un número de filas igual a `heightPrecalculationsRowsNumber` será elegido entre todos los datos(la distribución no es normal estrictamente hablando, pero está bien repartida y es aleatoria, así que debería ser relativamente representativa), se calcularán los altos de sus filas(usando un mismo elemento cada vez), y se calculará la media de esos valores.  
  La media calculada se usará como un alto constante para todas las filas.
  El alto calculado **NO** se usará para forzar el alto del elemento `tr`, simplemente se usará en los cálculos para el scroll una vez virtualizada la tabla.
- `'all'`: **NO USES ESTE MODO A NO SER QUE TENGAS UNA CANTIDAD MUY PEQUEÑA DE DATOS**. Cuando se crea la tabla(de nuevo, normalmente, cuando se carga la página), se creará un elemento en el DOM por CADA UNA de las filas, y se guardará el alto correcto a usar posteriormente.  
  Ten en cuenta que actualmente este modo **NO** está optimizado de ninguna manera, simplemente crea una fila "hidden" e itera TODOS los datos actualizando el DOM cada vez, así que es MUY lento.En mi ordenador todo el proceso tarda como 2.5 segundos para 1000 filas, con 100000 filas la página puede quedarse congelada más de 5 minutos.

<br>

## Columns

Todas las propiedades de los objetos son opcionales.

| NOMBRE     | OPCIONAL / OBLIGATORIO | VALOR                     | DESCRIPCIÓN                                                                                                |
  | -------- | -------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| template   | optional | function (`(reg) => string`) | Callback que retorne una `string` con el `content` del header(html, texto, lo que sea, pero una `string`). Como parámetro se provee el dato actual que se está calculando(reg) |
| style      | optional | string                       | La `string` será añadida al estilo de cada celda de esta columna                                                                                                                    |
| cellEvents | optional | array of objects             | Eventos de las celdas de esta columna: { name: nombre del evento, callback}                                                                                                       |
| width      | optional | `[number\|string]`           | Width de las celdas de esta columna                                                                                                                                 |
| title | mandatory(title o key o ambas deben existir)            | string | `HTML` del header como `string` |
| key      | mandatory(title o key o ambas deben existir)            | string                    | Key del header                                                                                                    |

Notas:
- Una de las propiedades `title` o `key`, o ambas, deben incluirse en todas las columnas.
- Si no se especifica una template, se pasará al `DOM` el valor de `reg[key || title]`, es decir, se buscará en cada registro, una propiedad con nombre igual a `key` si se incluyó en la configuración, o `title` en caso contrario. Si no se encuentra dicha propiedad, se pasa una string vacía.

<br>
<br>
<br>

# ENGLISH

# Data table config object:

| NAME                            | OPTIONAL / MANDATORY | VALUE                  | DEFAULT VALUE   | OTHER                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------- | -------------------- | ---------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tableId                         | optional             | -                      | -               | If not a string, will be converted to string with interpolation (`${config.tableId}`)                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| rowHeightMode                   | optional             | string enum            | `'constant'`    | See possible values below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| heightPrecalculationsRowsNumber | optional             | number                 | 200             | Ignored if row height is constant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| virtualSafeRows                 | optional             | number                 | 10              | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| rowsGutter                      | optional             | number                 | 0               | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| lastRowBottomOffset             | optional             | number                 | row height \* 5 | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| scrollBottomOffset | optional | number | 1000 | When scrolling down(`deltaY > 0` for the mouse wheel, or when keys `'ArrowDown'` or `'PageDown'` are pressed), if the scroll is >= `totalHeight - scrollBottomOffset`, table's scroll will set to the maximum possible | 
| checkUpdatedRows                | optional             | boolean                | false            | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| fixedHeaders                    | optional             | boolean                | true            | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| showRowHeaders                  | optional             | boolean                | false           | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| colHeadersClass                 | optional             | string                 | -               | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| colHeadersStyle                 | optional             | string                 | -               | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| colHeadersRowClass              | optional             | string                 | -               | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| colHeadersRowStyle              | optional             | string                 | -               | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| rowHeaderClass                  | optional             | string                 | -               | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| rowHeaderStyle                  | optional             | string                 | -               | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| rowsStyle                       | optional             | (reg, index) => string | -               | Callback that will return a string with the style of the row. The current data element(reg) and data index(index) will be provided as parameters of the callback                                                                                                                                                                                                                                                                                                                                                                                    |
| rowsClass                       | optional             | (reg, index) => string | -               | Callback that will return a string with the class name. The current data element(reg) and data index(index) will be provided as parameters of the callback. String will be assigned as it is to `className`                                                                                                                                                                                                                                                                                                                                         |
| saveScroll                      | optional             | boolean                | false           | Be careful, this uses the table `id` attribute as a key to save values in localStorage. If for some reason the id changes(between versions, for example), it does NOT clean the old keys and wouldn't be able to retreive the data. If you are using this, you may save the tables ids in a database, so you can set always the same ids to the same tables. Obviously, the table must have an id assigned or it will silently fail. Also, if you're using rowHeightMode `average`, it has a bias of approximately +-2 rows when loading the scroll |
| containerSelector               | mandatory            | string                 | -               | Table's container CSS selector                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| headers                         | mandatory            | array                  | -               | See possible values below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| filter | optional | function | - | Filter to apply to every registers | The table is filtered at loading and every time the function `filter` is called |
| sort | optional | function | - | Automatic sort function callback | Two data rows as parameters, basically the same as the native `sort` |
| columns                         | mandatory            | array                  | -               | See possible values below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

---

<br>
  
## Row height mode

Row height is needed for virtual calculations, the string value determines the way it's calculated:

`[constant|function|average|all]`

- `'constant'`: All rows will be trated as if they had the same height, which will be calculated by creating the first row and using its `clientHeight` attribute.  
  This is the lightest mode in performance terms.

The rest are for tables that will have rows with dynamic height:

- `'function'`: Datable creation will expect the config property `rowHeightFunction` to be a function with a numeric return value, which will be called on every row and use the returned value as each row height.  
  Take in mind that the function will only receive data as parameter, NOT the row DOM element, and will be calculated every time the data is updated, so is up to you how precise or accurate are the results.
- `'average'`: An arithmetic mean of rows will be calculated when the table is created (usually every time the page is loaded). A number of rows equal to `heightPrecalculationsRowsNumber` value will be selected accross all the data and their height used to calculate the mean.  
  The calculated mean will be used as a constant height for every rows.
  The calculated height will **NOT** be used to force the `tr` heights, just for the scroll's calcs to virtualize the table.
- `'all'`: **DON'T USE THIS UNLESS YOU HAVE VERY LITTLE AMOUNT OF DATA**. When the table is created, usually every time the page is loaded, a DOM element will be created per EACH and EVERY data row, and stored the correct height to be used.  
  Take in mind that right now this system has NOT been optimized in any way, it just create one hidden row and loop ALL the data updating the DOM for each one, so it is REALLY expensive. In my computer this process lasts like 2.5 seconds with 1000 rows, with 100000 rows your page could stay unresponsive more than 5 minutes.

<br>

## Columns

All the objects properties are optional

| NAME       | VALUE                        | OTHER                                                                                                                                                                          |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| template   | function (`(reg) => string`) | Callback that will return a string with the content of the header(html, text, whatever but a string). The current data element will be provided as a parameter of the callback |
| style      | string                       | The string will be added to every cell style of this column                                                                                                                    |
| cellEvents | array of objects             | Events of the cells of this column: { name: name of the event, callback}                                                                                                       |
| width      | `[number\|string]`           | Will set the width to all cells of this column                                                                                                                                 |
| title | mandatory(title or key or both must exist)            | string | Header's `HTML` as `string` |
| key      | mandatory(title or key or both must exist)            | string                    | Header's key                                                                                                    |

Notes:
- One of `title` or `key`, or both, must be included on every column.
- If template is not specified, `reg[key || title]` will be passed to the `DOM`, that's to say, for each register it will search for property with name equal to `key`'s value if it was included in the configuration, or `title`'s value in other case. If no property will be found, an empty `string` will be passed.
