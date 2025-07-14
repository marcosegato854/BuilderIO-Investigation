const getReactConfig = require('@nrwl/react/plugins/webpack')
const rootMain = require('../../../.storybook/main')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const { NODE_ENV } = process.env
const stories =
  NODE_ENV === 'production'
    ? [
        ...rootMain.stories,
        '../src/components/atoms/**/*.stories.mdx',
        '../src/components/atoms/**/*.stories.@(js|jsx|ts|tsx)',
        '../src/components/**/**/*.public.stories.mdx',
        '../src/components/**/**/*.public.stories.@(js|jsx|ts|tsx)',
      ]
    : [
        ...rootMain.stories,
        '../src/**/*.stories.mdx',
        '../src/**/*.stories.@(js|jsx|ts|tsx)',
      ]
const path = require('path')
const toPath = (filePath) => path.join(process.cwd(), filePath)

module.exports = {
  ...rootMain,

  core: { ...rootMain.core, builder: 'webpack5' },

  stories,
  addons: [...rootMain.addons, '@nrwl/react/plugins/storybook'],
  webpackFinal: async (config, env) => {
    const { configType } = env
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (rootMain.webpackFinal) {
      config = await rootMain.webpackFinal(config, { configType })
    }
    // const parsedConfig = getReactConfig(config, env);

    // add your own webpack tweaks if needed
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: './node_modules/@myvr/mmap-wasm/WASM/mMapSDK.js',
            to: 'mMapSDK/WASM/mMapSDK.js',
          },
          {
            from: './node_modules/@myvr/mmap-wasm/WASM/mMapSDK.wasm',
            to: 'mMapSDK/WASM/mMapSDK.wasm',
          },
          {
            from: './node_modules/@myvr/mmap-wasm/WASM/mMapSDK.worker.js',
            to: 'mMapSDK/WASM/mMapSDK.worker.js',
          },
          {
            from: './node_modules/@myvr/mmap-wasm/WASM/mMapSDK.worker.wasm',
            to: 'mMapSDK/WASM/mMapSDK.worker.wasm',
          },
          {
            from: './node_modules/@myvr/mmap-wasm/WASMT/mMapSDK.js',
            to: 'mMapSDK/WASMT/mMapSDK.js',
          },
          {
            from: './node_modules/@myvr/mmap-wasm/WASMT/mMapSDK.wasm',
            to: 'mMapSDK/WASMT/mMapSDK.wasm',
          },
          {
            from: './node_modules/@myvr/mmap-wasm/WASMT/mMapSDK.worker.js',
            to: 'mMapSDK/WASMT/mMapSDK.worker.js',
          },
        ],
      })
    )

    // console.log(
    //   'webpack.config.overrides.js (54) # config.resolve.fallback.crypto',
    //   Object.keys(config.resolve)
    // );
    // throw new Error('quit');

    try {
      // applyCryptoPolyfill(config);
      applyNodeSassImplementation(config)
      dontParseUrlInScss(config)
    } catch (error) {
      logConfigToFile(config)
    }

    // TODO: restore
    // if (env === 'production') {
    //   config.optimization = {
    //     minimize: true,
    //     minimizer: [
    //       new TerserPlugin({
    //         terserOptions: {
    //           compress: {
    //             pure_funcs: [
    //               'console.log',
    //               'console.info',
    //               'console.debug',
    //               'console.warn',
    //             ],
    //           },
    //         },
    //       }),
    //     ],
    //   }
    // }
    // console.log('webpack.config.overrides.js (72) # config', config);
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          '@emotion/core': toPath('node_modules/@emotion/react'),
          'emotion-theming': toPath('node_modules/@emotion/react'),
        },
      },
    }
  },
}

const dontParseUrlInScss = (config) => {
  /** without react-scripts */
  config.module.rules[9].oneOf[0].use[1].options.url = false
  config.module.rules[9].oneOf[1].use[1].options.url = false
  config.module.rules[9].oneOf[2].use[1].options.url = false
  config.module.rules[9].oneOf[3].use[1].options.url = false
  /** end without react-scripts */
  // config.module.rules[5].oneOf[5].use[1].options.url = false;
  // config.module.rules[5].oneOf[6].use[1].options.url = false;
  // config.module.rules[5].oneOf[7].use[1].options.url = false;
  // config.module.rules[5].oneOf[8].use[1].options.url = false;
  // config.module.rules[8].oneOf[0].use[1].options.url = false;
  // config.module.rules[8].oneOf[1].use[1].options.url = false;
  // config.module.rules[8].oneOf[2].use[1].options.url = false;
  // config.module.rules[8].oneOf[3].use[1].options.url = false;
}

const applyNodeSassImplementation = (config) => {
  /** without react-scripts */
  config.module.rules[9].oneOf[1].use[3].options.implementation = require('node-sass')
  config.module.rules[9].oneOf[5].use[3].options.implementation = require('node-sass')
  /** end without react-scripts */
  // config.module.rules[5].oneOf[7].use[4].options.implementation = require('node-sass');
  // config.module.rules[5].oneOf[8].use[4].options.implementation = require('node-sass');
  // config.module.rules[8].oneOf[1].use[3].options.implementation = require('node-sass');
  // config.module.rules[8].oneOf[5].use[3].options.implementation = require('node-sass');
}

const applyCryptoPolyfill = (config) => {
  config.resolve.fallback = config.resolve.fallback || {}
  // config.resolve.fallback.crypto = false;
  config.resolve.fallback.stream = require.resolve('stream-browserify')
  config.resolve.fallback.buffer = require.resolve('buffer/')
  // config.resolve.fallback['crypto-browserify'] =
  //   require.resolve('crypto-browserify'); //if you want to use this module also don't forget npm i crypto-browserify
}

const logConfigToFile = (config) => {
  // file system module to perform file operations
  const fs = require('fs')
  // stringify JSON Object
  var jsonContent = JSON.stringify(config)
  fs.writeFile('logConfigStorybook.json', jsonContent, 'utf8', function (err) {
    if (err) {
      console.log('An error occured while writing JSON Object to File.')
      return console.log(err)
    }
    console.log('JSON file has been saved.')
    throw new Error('quit')
  })
}
