const path = require('path')
process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_HELIUM_VERSION =
  require('./package.json').dependencies['@dextf_admin_it/helium'] || '?'

if (process.env.VUE_APP_GA_ID) {
  process.env.VUE_APP_GA_SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${process.env.VUE_APP_GA_ID}`
} else {
  process.env.VUE_APP_GA_SCRIPT_SRC = ''
}

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// const StatsPlugin = require('stats-webpack-plugin')

const webpackMode = process.env.VUE_APP_WEBPACK_MODE
const webpackMinimize = process.env.VUE_APP_WEBPACK_MINIMIZE === 'true'
const webpackMapFiles = process.env.VUE_APP_WEBPACK_MAP_FILES === 'true'

console.log('process.env.NODE_ENV:', process.env.NODE_ENV)
console.log('Webpack mode:', webpackMode)
console.log('Webpack minimize:', webpackMinimize)
console.log('Generate Source Maps:', webpackMapFiles)
console.log('S3 Bucket:', process.env.VUE_APP_S3D_BUCKET)
console.log('CloudFront ID', process.env.VUE_APP_S3D_CLOUDFRONT_ID)

console.log(
  'Google Analytics:',
  Boolean(process.env.VUE_APP_GA_ID)
    ? `enabled (MEASUREMENT ID ${process.env.VUE_APP_GA_ID})`
    : 'disabled'
)

const plugins = []

// plugins.push(new BundleAnalyzerPlugin())
// plugins.push(new StatsPlugin('stats.json'))

// Define path to custom aliases
const heliumPath = __dirname + '/node_modules/@dextf_admin_it/helium'
const galliumPath = __dirname + '/node_modules/@dextf_admin_it/gallium-sdk'
const spjsPath = __dirname + '/node_modules/setprotocol.js'

module.exports = {
  pluginOptions: {
    s3Deploy: {
      registry: undefined,
      awsProfile: 'default',
      region: 'ap-southeast-1',
      bucket: process.env.VUE_APP_S3D_BUCKET,
      createBucket: false,
      staticHosting: true,
      staticIndexPage: 'index.html',
      staticErrorPage: 'index.html',
      assetPath: 'dist',
      assetMatch: '**',
      deployPath: '/',
      acl: 'public-read',
      pwa: false,
      enableCloudfront: true,
      cloudfrontId: process.env.VUE_APP_S3D_CLOUDFRONT_ID,
      cloudfrontMatchers: '/*',
      uploadConcurrency: 5,
      pluginVersion: '4.0.0-rc3'
    }
  },
  publicPath: '/',
  devServer: {
    // make the server to be accessible externally
    host: '0.0.0.0'
  },
  productionSourceMap: webpackMapFiles,
  configureWebpack: {
    mode: webpackMode,
    optimization: {
      minimize: webpackMinimize,
      splitChunks: {
        maxSize: 240000
      }
    },
    resolve: {
      alias: {
        '@helium': path.resolve(heliumPath, 'dist/src'),
        '@gallium': path.resolve(galliumPath, 'dist/src'),
        '@spjs': path.resolve(spjsPath, 'dist/src')
      }
    },
    plugins: plugins
  }
}
