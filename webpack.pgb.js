const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

common.htmlPlugin.options.phonegap = true;

module.exports = merge(common.config, {
  output: {
    path: __dirname + '/dist/cordova',
    publicPath: ''
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      },
      PHONEGAP: true,
      BACKEND_URL: JSON.stringify('https://domain.com/'),
      VERSION: JSON.stringify(JSON.parse(fs.readFileSync('./package.json')).version),
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false
    }),
    new CopyWebpackPlugin([
      { from: 'src/cordova', to: './', ignore: ['config.xml'] },
      { 
        from: 'src/cordova/config.xml',
        to: 'config.xml',
        transform: function(content) {
          return content.toString().replace(/version=".*?"/, 'version="' + JSON.parse(fs.readFileSync('./package.json')).version + '"');
        }
      }
    ], { context: __dirname }),
    new ZipPlugin({
      path: __dirname + '/dist',
      filename: 'pgb.zip',
      fileOptions: {
        mtime: new Date(),
        mode: 0o100664,
        compress: true,
        forceZip64Format: false,
      },
      zipOptions: {
        forceZip64Format: false,
      }
    })
  ]
});
