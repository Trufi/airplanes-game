const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');

const dist = path.join(__dirname, 'dist');

fs.copySync(
  path.join(__dirname, 'node_modules/@2gis/jakarta/dist/jakarta.js'),
  path.join(dist, 'jakarta.js'),
);

fs.copySync(
  path.join(__dirname, 'node_modules/@2gis/jakarta/dist/jakarta.js.map'),
  path.join(dist, 'jakarta.js.map'),
);

fs.copySync(
  path.join(__dirname, 'node_modules/@2gis/jakarta/dist/assets/fonts'),
  path.join(dist, 'assets/fonts'),
);

fs.copySync(path.join(__dirname, 'assets'), path.join(dist, 'assets'));

const production = process.env.NODE_ENV === 'production';

const tsCheckerPlugin = new ForkTsCheckerWebpackPlugin({
  watch: ['./src'],
});

const plugins = [tsCheckerPlugin];

if (production) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ sourceMap: true }));
}

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
    extensions: ['.ts', '.js'],
  },

  entry: './client/index.ts',

  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist',
  },

  plugins,

  devtool: 'source-map',

  devServer: {
    host: '0.0.0.0',
    port: 3000,
    stats: {
      modules: false,
    },
    disableHostCheck: true,
  },
};
