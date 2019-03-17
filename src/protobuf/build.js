const schema = require('protocol-buffers-schema');
const compile = require('pbf/compile');
const path = require('path');
const fs = require('fs');

console.log('Transpile protobuf to JS');

const inputPath = path.join(__dirname, './source');
const outputPath = path.join(__dirname);

fs.readdirSync(inputPath).forEach((name) => {
  const proto = schema.parse(fs.readFileSync(path.join(inputPath, name)));
  const code = compile.raw(proto);
  fs.writeFileSync(path.join(outputPath, name + '.js'), code, 'utf8');
});
