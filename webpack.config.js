const path = require('path');

module.exports = {
  entry: {
      collect : './src/collect.js',
      bg : './src/bg.js'
  },
  output: {
    filename: '[name].entry.js',
    path: path.resolve(__dirname, 'dest')
  },
  module: {
    loaders: [
      { test: /\.js/, exclude: [/app\/lib/, /node_modules/], loader: 'babel-loader' },
    ],
  },
  stats: {
    colors: true
  },
  devtool: 'source-map'
};
