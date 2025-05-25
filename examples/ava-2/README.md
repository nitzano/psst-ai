# AVA Example 2

This example demonstrates AVA configuration through an external `ava.config.js` file.

## Features

- External configuration file (`ava.config.js`)
- Serial test execution (concurrency disabled)
- Babel integration for ES6+ support
- Custom file patterns
- Test timeout configuration

## Configuration

The AVA configuration is defined in `ava.config.js`:

```javascript
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
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:serial   # Run tests serially (explicit)
npm run test:match    # Run only unit tests
```
