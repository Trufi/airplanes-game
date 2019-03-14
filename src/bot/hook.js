const tsConfig = require('../../tsconfig');

// Меняем тип модулей, т.к. mocha не понимает es6
tsConfig.compilerOptions.module = 'commonjs';

// Добавляем в сборку JS файлы с ES6-модулями
tsConfig.compilerOptions.allowJs = true;
tsConfig.ignore = [/node_modules\/(?!@2gis\/gl-matrix|2gl)/];

require('ts-node').register(tsConfig);

require('./index.ts');
