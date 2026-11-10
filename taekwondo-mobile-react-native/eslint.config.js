// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    files: ["scripts/**/*.js", "*.config.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
  },
  {
    ignores: ["dist/*"],
  }
]);
