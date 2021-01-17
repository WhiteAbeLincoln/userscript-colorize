const fs = require('fs')
const pkg = require('./package.json')
const babel = require('@rollup/plugin-babel').default
const resolve = require('@rollup/plugin-node-resolve').default
const json = require('@rollup/plugin-json')
const commonjs = require('@rollup/plugin-commonjs')
const { terser } = require('rollup-plugin-terser')
const DIST = 'dist'
const FILENAME = 'index'
const BANNER = fs
  .readFileSync('src/meta.txt', 'utf8')
  .replace('process.env.VERSION', pkg.version)

const bundleOptions = {
  extend: true,
  esModule: false,
}
const extensions = ['.ts', '.tsx', '.mjs', '.js', '.jsx']

const rollupConfig = [
  {
    input: {
      input: 'src/index.ts',
      plugins: [
        babel({
          root: process.env.BABEL_ROOT || process.cwd(),
          babelHelpers: 'runtime',
          plugins: [
            [
              require.resolve('@babel/plugin-transform-runtime'),
              {
                useESModules: true,
                version: '^7.5.0',
              },
            ],
          ],
          exclude: 'node_modules/**',
          extensions,
        }),
        process.env.NODE_ENV === 'production' ? terser({
          format: {
            // this stupid terser plugin serializes any javascript function
            // passed to it, meaning I lose closures and so can't test for BANNER
            comments: 'all'
          }
        }) : null,
        commonjs(),
        json(),
        resolve({ extensions }),
      ].filter(Boolean),
    },
    output: {
      format: 'iife',
      file: `${DIST}/${FILENAME}.user.js`,
      ...bundleOptions,
    },
  },
]

rollupConfig.forEach(item => {
  item.output = {
    indent: false,
    // If set to false, circular dependencies and live bindings for external imports won't work
    externalLiveBindings: false,
    ...item.output,
    ...(BANNER && {
      banner: BANNER,
    }),
  }
})

module.exports = rollupConfig.map(({ input, output }) => ({
  ...input,
  output,
}))
