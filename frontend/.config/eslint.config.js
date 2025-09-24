module.exports = {
  extends: [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  rules: {
    "comma-dangle": ["error", "never"],
    semi: ["error", "never"],
    quotes: ["error", "single"],
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "array-element-newline": ["error", "consistent"],
    "array-bracket-newline": ["error", "consistent"],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
