export default {
  extends: ["plugin:@typescript-eslint/recommended"],
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  plugins: ["@typescript-eslint/eslint-plugin"],
  ignorePatterns: ["**/.eslintrc.js", "**/dist"],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
