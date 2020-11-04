// https://github.com/arackaf/customize-cra/blob/HEAD/api.md#addlessloaderloaderoptions
const {
  override,
  fixBabelImports,
  addWebpackPlugin,
  overrideDevServer,
  addWebpackExternals, // cdn 引入
  addWebpackAlias,
  addDecoratorsLegacy
} = require('customize-cra')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin')

const DashboardPlugin = require('webpack-dashboard/plugin')

// TODO 设置端口号
process.env.PORT = 3006
// path
const resolveAlias = dir => path.join(__dirname, '.', dir)
// 热跟新
const hotLoader = () => (config, env) => {
  config = rewireReactHotLoader(config, env)
  return config
}
const getProxyConfig = keys => {
  const proxyConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, './proxy.env')))
  for (const key of keys) {
    if (proxyConfig[key]) {
      return proxyConfig[key]
    }
  }
}
const genPathRewriteFunc = (curPath, keys) => {
  return (path, req) => {
    const val = getProxyConfig(keys)
    if (!val) {
      return path
    }
    return path.replace(curPath, val)
  }
}
const addProxy = () => configFunction => {
  configFunction.proxy = {
    '/api': {
      target: 'https://placeholder.com/',
      changeOrigin: true,
      secure: false,
      xfwd: false,
      pathRewrite: genPathRewriteFunc('/api', ['API_PATH_REWRITE']),
      router: () => getProxyConfig(['API_TARGET', 'TARGET'])
    },
    '/saas': {
      target: 'https://placeholder.com/',
      changeOrigin: true,
      secure: false,
      xfwd: false,
      pathRewrite: genPathRewriteFunc('/sass', ['SASS_PATH_REWRITE']),
      router: () => getProxyConfig(['SASS_TARGET', 'TARGET'])
    }
  }
  return configFunction
}

const stylus = () => config => {
  const stylusLoader = {
    test: /\.styl$/,
    use: [
      {
        loader: 'style-loader'
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            mode: 'local',
            // 样式名规则配置
            localIdentName: '[local]--[hash:base64:5]'
          }
        }
      },
      {
        loader: 'stylus-loader'
      }
    ]
  }
  const oneOf = config.module.rules.find(rule => rule.oneOf).oneOf
  oneOf.unshift(stylusLoader)
  return config
}

module.exports = {
  webpack: override(
    fixBabelImports('import', {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: 'css'
    }),
    addWebpackPlugin(
      new AntdDayjsWebpackPlugin() // 官方推荐替换moment.js 大幅减少打包体积
    ),
    addWebpackPlugin(
      new DashboardPlugin() // 仪表盘
    ),
    addWebpackExternals({
      React: 'React'
    }),
    addWebpackAlias({
      '@': resolveAlias('src')
      // lib: resolveAlias('src/lib'),
      // components: resolveAlias('src/components'),
      // images: resolveAlias('src/assets/images'),
      // styled: resolveAlias('src/assets/styled'),
      // views: resolveAlias('src/views'),
      // store: resolveAlias('src/store'),
      // router: resolveAlias('src/router'),
      // locale: resolveAlias('src/locale'),
      // 处理警告  React-Hot-Loader: react-🔥-dom patch is not detected. React 16.6+ features may not work.
      // 'react-dom': '@hot-loader/react-dom'
    }),
    addDecoratorsLegacy(), // 支持装饰器
    stylus()
  ),
  devServer: overrideDevServer(addProxy())
}
