const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const path = require('path');
const fs = require('fs-extra');
const cssnext = require('postcss-cssnext');

const dist = path.join(__dirname, 'dist', 'client');
fs.copySync(path.join(__dirname, 'assets'), path.join(dist, 'assets'));

module.exports = (_, args) => {
  const production = args.mode === 'production';

  return {
    module: {
      rules: [
        {
          test: /(\.ts|\.tsx|\.js)$/,
          exclude: [
            /node_modules(\/|\\)(?!@2gis(\/|\\)gl-matrix|2gl)/,
            path.resolve(__dirname, 'src/client/jakarta/jakarta.js'),
          ],
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        },
        {
          test: /\.css$/,
          include: /src/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[folder]__[local]-[hash:base64:5]',
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  cssnext({
                    browsers: ['last 2 versions'],
                  }),
                ],
              },
            },
          ],
        },
      ],
    },

    resolve: {
      extensions: ['.ts', '.js', '.tsx'],
    },

    entry: './src/client/index.tsx',

    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist', 'client'),
      publicPath: '/',
    },

    plugins: [
      new Dotenv(),
      new ForkTsCheckerWebpackPlugin({
        watch: ['./src'],
      }),
      new HtmlWebpackPlugin({
        template: 'src/client/index.html',
      }),
    ],

    node: {
      fs: 'empty',
    },

    devtool: production ? false : 'source-map',

    devServer: {
      contentBase: path.resolve(__dirname, 'dist', 'client'),
      host: '0.0.0.0',
      port: 3000,
      stats: {
        modules: false,
      },
      disableHostCheck: true,
    },
  };
};
