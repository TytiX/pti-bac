var webpack = require('webpack');

module.exports = {
  devServer: {
    proxy: {
      '/api/*': {
        target: 'http://localhost:3030',
        changeOrigin: true
      },
      '/*': {
        target: 'http://localhost:3030',
        ws: true,
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.GOOGLE_ANALYTICS_ID': process.env.GOOGLE_ANALYTICS_ID
      })
    ]
  },
  pluginOptions: {
    i18n: {
      locale: 'fr',
      fallbackLocale: 'fr',
      localeDir: 'assets/locales',
      enableInSFC: false
    }
  }
};
