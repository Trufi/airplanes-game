const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const fs = require('fs-extra');

const dist = path.join(__dirname, 'dist');
fs.copySync(path.join(__dirname, 'assets'), path.join(dist, 'assets'));

module.exports = (_, args) => {
  const production = args.mode === 'production';

  return {
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
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },

    plugins: [
      new ForkTsCheckerWebpackPlugin({
        watch: ['./src'],
      }),
      new HtmlWebpackPlugin({
        template: 'src/client/index.html',
      }),
    ],

    devtool: production ? false : 'source-map',

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
};
