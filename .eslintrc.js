module.exports = {
  extends: [
    'airbnb-base',
    'plugin:jest/recommended',
    'plugin:security/recommended',
  ],
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'max-len': ['error', { code: 120 }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'consistent-return': 'off',
  },
  overrides: [
    {
      files: ['tests/**/*'],
      rules: {
        'no-unused-expressions': 'off',
      },
    },
    {
      files: ['scripts/**/*'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};