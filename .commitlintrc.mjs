export default {
  plugins: [],
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['global']],
  },
};
