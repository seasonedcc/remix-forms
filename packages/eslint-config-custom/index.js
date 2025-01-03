module.exports = {
  extends: ['prettier'],
  parser: '@typescript-eslint/parser',
  rules: {
    'react/jsx-key': 'off',
    'react/display-name': 'off',
  },
  ignorePatterns: ['**/*.js', '**/*.mjs', '**/*.d.ts', '**/dist', '**/tsc'],
}
