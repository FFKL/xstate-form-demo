const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'src/index.html' }),
    new CleanWebpackPlugin(),
  ],
  devtool: 'inline-source-map',
  resolve: {
    alias: {
      'xstate-form': path.resolve(__dirname, '../lib/dist/index.js'),
    },
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 9090,
  },
};

module.exports = config;
