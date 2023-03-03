[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-f4981d0f882b2a3f0472912d15f9806d57e124e0fc890972558857b51b24a6f9.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=10349603)
# Práctica Espree logging

## Resumen de lo aprendido
Se han descrito scripts en el package.json con los cuales se ponen a prueba el funcionamiento del programa.
``` js
"scripts": {
    "test": "mocha ./test/test.mjs",
    "doc": "c8 npm test",
    "exec1": "node bin/log.js ./test/data/test1.js",
    "exec2": "node bin/log.js ./test/data/test2.js",
    "exec3": "node bin/log.js ./test/data/test3.js",
    "exec-out": "node bin/log.js ./test/data/test3.js -o ./bin/output.js",
    "cov": "c8 npm run test",
    "cov_report": "c8 --reporter=html --reporter=text --report-dir=docs mocha",
    "jsdoc": "jsdoc2md --files src/*.js > jsdoc/README.md"
  }
```

Gracias a GitHub Actions se realizan test con integración continua.

<img width="811" alt="image" src="https://user-images.githubusercontent.com/33846493/222571872-bb39fc1a-ea91-45a9-aabc-209441f7b41a.png">

Se ha creado un paquete que ha sido publicado en npmjs con ámbito [mrdoniz](https://www.npmjs.com/package/@mrdoniz/espree-logging-daniel-doniz-garcia-alu0101217277).
<img width="722" alt="image" src="https://user-images.githubusercontent.com/33846493/222572595-2ccdb644-b531-40dd-a4ac-eb8b9fa572c0.png">


Finalmente se realiza un estudio de cobertura y se ha aprendido el significado del versionado.

<img width="703" alt="image" src="https://user-images.githubusercontent.com/33846493/222570433-766506a0-f8c5-44b9-ba23-bf6f1816669b.png">


## Indicar los valores de los argumentos

Se ha modificado el código de `logging-espree.js` para que el log también indique los valores de los argumentos que se pasaron a la función. 
Ejemplo:

```js
function foo(a, b) {
  var x = 'blah';
  var y = (function (z) {
    return z+3;
  })(2);
}
foo(1, 'wut', 3);
```

```javascript
function foo(a, b) {
    console.log(`Entering foo(${ a }, ${ b })`);
    var x = 'blah';
    var y = function (z) {
        console.log(`Entering <anonymous function>(${ z })`);
        return z + 3;
    }(2);
}
foo(1, 'wut', 3);
```

## CLI con [Commander.js](https://www.npmjs.com/package/commander)
Se han añadido opciones -h y -V automáticamente con Commander, y una opción que permite especificar el fichero de salida.

``` js
#!/usr/bin/env node

import { program } from "commander";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { version } = require("../package.json");
import { transpile } from "../src/logging-espree.js";

program
  .version(version)
  .argument("<filename>", 'file with the original code')
  .option("-o, --output <filename>", "file in which to write the output")
  .action((filename, options) => {
    transpile(filename, options.output);
  });

program.parse(process.argv);
```

La opción -h nos permite mostrar una descripción del programa y sus opciones por la terminal.

<img width="784" alt="image" src="https://user-images.githubusercontent.com/33846493/222568940-eff4b641-5f49-41cc-a0b5-bb41240a2dbf.png">

La opción -V muestra la versión del programa. En este caso es la versión 1.0.4, ya que se trata de la primera versión funcional, no han habido parches y se han arreglado cuatro fallos.

<img width="782" alt="image" src="https://user-images.githubusercontent.com/33846493/222569015-1555c9f7-bf60-4385-8e91-98c2ea887f90.png">

La opción -o <nombre-del-fichero> vuelca la salida en el archivo que especifiquemos.

<img width="931" alt="image" src="https://user-images.githubusercontent.com/33846493/222569285-cb8fe84b-60db-4ff4-9bbc-4a2c3686099d.png">


## Reto 1: Soportar funciones flecha
Se ha añadido una condición a la entrada del traverse de espree para que también analice nodos ArrowFunctionExpression.
``` js
 export function addLogging(code) {
  const ast = espree.parse(code, {ecmaVersion:6, loc:true});
  estraverse.traverse(ast, {
    enter: function (node, parent) {
      if (node.type === 'FunctionDeclaration' || 
          node.type === 'FunctionExpression' || 
          node.type === 'ArrowFunctionExpression') {
          let location = node.loc.start;
          addBeforeCode(node, location.line);
      }
    }
  });
  return escodegen.generate(ast);
} 
```


## Reto 2: Añadir el número de línea
Se ha creado la variable lines, con la cual se obtiene la propiedad del número de línea de la localización de comienzo del nodo. Gracias a esta se añade al mensaje que se implementa en el código.
``` js
function addBeforeCode(node, lines) {
  const name = node.id ? node.id.name : '<anonymous function>';
  const parameters = node.params.map(param => `\$\{${param.name}\}`);
  const beforeCode = "console.log(`Entering " + name + "(" + parameters + ") at line " + lines + "`);";
  const beforeNodes = espree.parse(beforeCode, {ecmaVersion:6}).body;
  node.body.body = beforeNodes.concat(node.body.body);
}
```


## Tests and Covering
Se realiza un estudio de cobertura del programa, con el script `npm run cov`. Se utiliza c8 porque nyc causa problemas.
    
<img width="703" alt="image" src="https://user-images.githubusercontent.com/33846493/222570433-766506a0-f8c5-44b9-ba23-bf6f1816669b.png">

