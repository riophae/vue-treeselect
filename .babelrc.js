module.exports = api => {
  api.cache.never()

  const presets = [
    [ '@babel/preset-env', { modules: false } ],
  ]
  const plugins = [
    '@vue/babel-plugin-jsx',
    '@babel/plugin-transform-runtime',
  ]

  if (process.env.NODE_ENV === 'testing') {
    plugins.push('istanbul')
  }

  return { presets, plugins, comments: false }
}
