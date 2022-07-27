module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'prettier',
  ],
  rules: {
    'react/jsx-key': 'off',
    'react/display-name': 'off',
  },
}
