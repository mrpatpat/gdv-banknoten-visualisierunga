const path = require('path');
const src = __dirname + "/src";
const dist = __dirname + "/dist";
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: path.join(src, '/index.ts'),
    output: {
        filename: 'index.js',
        path: dist
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.csv$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    emitFiles: true
                }
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin(
            {
                template: src + "/index.html"
            }
        )
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
};