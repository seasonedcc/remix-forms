module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  rules: {
    'react/jsx-key': 'off',
    'react/display-name': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  ignorePatterns: ['**/*.js', '**/*.mjs', '**/*.d.ts', '**/dist', '**/tsc'],
}
