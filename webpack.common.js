const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const htmlPlugin = new HtmlWebpackPlugin({
  template: './index.html',
  filename: 'index.html',
  favicon: 'favicon.ico',
  inject: 'body',
  minify: {
    collapseWhitespace: true
  }
});

module.exports.htmlPlugin = htmlPlugin;

module.exports.config = {
  context: __dirname + '/src/client',
  entry: ['babel-polyfill', './index.js'],
  output: {
    path: __dirname + '/dist/client',
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /favicon.ico/, loader: 'file-loader', exclude: /node_modules/ },
      { 
        test: /manifest.json/, 
				use: [
					{ loader: 'file-loader', options: { name: 'manifest.json' } },
					{ loader: 'web-app-manifest-loader' }
        ],
        exclude: /node_modules/
      },
      { test: /\.(png|svg)$/, loader: 'file-loader?name=images/[hash].[ext]' },
      {
          test: /\.(eot|ttf|woff|woff2)$/,
          loader: 'file-loader?name=fonts/[name].[ext]'
      }
    ]
  },
  resolve: {
    alias: {
      actions: path.resolve(__dirname, 'src/client/app/actions/'),
      components: path.resolve(__dirname, 'src/client/app/components/'),
      pages: path.resolve(__dirname, 'src/client/app/pages/'),
      services: path.resolve(__dirname, 'src/client/app/services/'),
      stores: path.resolve(__dirname, 'src/client/app/stores/'),
      images: path.resolve(__dirname, 'src/client/images/'),
      config$: path.resolve(__dirname, 'src/client/app/config.js'),
      dispatcher$: path.resolve(__dirname, 'src/client/app/dispatcher.js')
    }
  },
  plugins: [
    htmlPlugin
  ]
};
