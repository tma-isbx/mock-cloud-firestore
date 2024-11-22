module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: ['airbnb-base'],
  env: {
    node: true,
    qunit: true,
  },
  rules: {
    'require-jsdoc': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',

    // FIXME: Ideally this should be turned on
    'import/no-cycle': 'off',

    'no-restricted-syntax': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
};
