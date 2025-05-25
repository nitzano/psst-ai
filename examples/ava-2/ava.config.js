export default {
  files: [
    'test/**/*.test.js',
    'src/**/*.test.js'
  ],
  concurrency: false, // Run tests serially
  timeout: '10s',
  require: [
    '@babel/register'
  ],
  babel: {
    testOptions: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }]
      ]
    },
    extensions: ['js', 'jsx']
  },
  match: [
    '*unit*'
  ],
  verbose: false
};
