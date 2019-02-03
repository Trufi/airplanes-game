const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

const production = process.env.NODE_ENV === 'production';

const tsCheckerPlugin = new ForkTsCheckerWebpackPlugin({
    watch: ['./src'],
});

const plugins = [tsCheckerPlugin];

if (production) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({sourceMap: true}));
}

module.exports = {
    module: {
        rules: [{
            test: /(\.ts|\.tsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            },
        }],
    },

    resolve: {
        extensions: ['.ts', '.js'],
    },

    entry: './src/index.ts',

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
    }
};
