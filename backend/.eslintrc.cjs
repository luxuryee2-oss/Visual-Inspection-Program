module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.base.json']
  },
  plugins: ['@typescript-eslint'],
  extends: ['standard-with-typescript'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off'
  },
  ignorePatterns: ['dist', 'coverage']
};

