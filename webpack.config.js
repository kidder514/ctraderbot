const path = require('path')
const webpack = require('webpack')
const nodeExternals = require('webpack-node-externals')
const {
    NODE_ENV = 'production',
} = process.env;
module.exports = {
    entry: './src/index.js',
    mode: NODE_ENV,
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.js'
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    externals: [nodeExternals()],
}