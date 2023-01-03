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
  },
}
