// eslint.config.js
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      "no-unused-vars": "off", // turn off base rule
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          // use TS-aware rule
          vars: "all", // check all variables
          args: "after-used", // check unused args
          ignoreRestSiblings: true, // ignore rest siblings
          varsIgnorePattern: "^_", // ignore vars starting with _
          argsIgnorePattern: "^_", // ignore args starting with _
        },
      ],
    },
  },
]);
