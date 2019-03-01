const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');

const dist = path.join(__dirname, 'dist');

fs.copySync(path.join(__dirname, 'src/client/index.html'), path.join(dist, 'index.html'));

fs.copySync(path.join(__dirname, 'assets'), path.join(dist, 'assets'));

fs.copySync(
  path.join(__dirname, 'node_modules/@2gis/jakarta/dist/assets/fonts'),
  path.join(dist, 'assets/fonts'),
);

module.exports = {
  module: {
    rules: [
      {
        test: /(\.ts|\.tsx|\.js)$/,
        exclude: /node_modules(\/|\\)(?!@2gis(\/|\\)gl-matrix|2gl)/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },

  entry: './src/client/index.tsx',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin({
      watch: ['./src'],
    }),
  ],

  devtool: 'source-map',

  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    host: '0.0.0.0',
    port: 3000,
    stats: {
      modules: false,
    },
    disableHostCheck: true,
  },
};
