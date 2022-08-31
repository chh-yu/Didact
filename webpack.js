const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        app: './src/index.js'
    },
    mode: 'development',
    devServer: {
        watchFiles: './dist',
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
        title: 'My react',
        template: './public/index.html'
        })
    ],
    resolve: {
    },
    module: {
        rules: []
    }
}