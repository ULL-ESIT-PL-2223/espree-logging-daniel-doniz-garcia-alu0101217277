import * as escodegen from "escodegen";
import * as espree from "espree";
import * as estraverse from "estraverse";
import * as fs from "fs/promises";

export async function transpile(inputFile, outputFile) {
  let input = await fs.readFile(inputFile, 'utf-8')
  const output = addLogging(input);
  if (outputFile === undefined) {
    return;
  }
  await fs.writeFile(outputFile, output)
}

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

function addBeforeCode(node, lines) {
  const name = node.id ? node.id.name : '<anonymous function>';
  const parameters = node.params.map(param => `\$\{${param.name}\}`);
  const beforeCode = "console.log(`Entering " + name + "(" + parameters + ") at line " + lines + "`);";
  const beforeNodes = espree.parse(beforeCode, {ecmaVersion:6}).body;
  node.body.body = beforeNodes.concat(node.body.body);
}
