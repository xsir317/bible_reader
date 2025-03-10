const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        fallback: {
          "crypto": require.resolve("crypto-browserify"),
          "stream": require.resolve("stream-browserify"),
          "buffer": require.resolve("buffer/"),
          "util": require.resolve("util/"),
          "constants": require.resolve("constants-browserify"),
          "vm": require.resolve("vm-browserify"),
          'process/browser': require.resolve('process/browser')
        }
      },
      plugins: [
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
      ]
    }
  }
};