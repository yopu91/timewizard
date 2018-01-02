const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const fs = require('fs');

module.exports = merge(common.config, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      },
      BACKEND_URL: JSON.stringify('/'),
      PHONEGAP: false,
      VERSION: JSON.stringify(JSON.parse(fs.readFileSync('./package.json')).version + '-dev'),
    }),
    new LiveReloadPlugin({ appendScriptTag: true })
  ]  
});
