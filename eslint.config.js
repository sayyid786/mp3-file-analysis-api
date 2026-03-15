// Import the base recommended JavaScript rules from ESLint
const eslint = require('@eslint/js');

// Import the TypeScript ESLint utilities and recommended configs
const tseslint = require('typescript-eslint');

// Import the Prettier plugin configuration that integrates Prettier with ESLint
// and enables the prettier/prettier rule
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

// Export the ESLint flat configuration using the typescript-eslint helper
module.exports = tseslint.config(
  {
    // Ignore compiled output so ESLint doesn't lint generated files
    ignores: ['build/**'],
  },
  {
    // Apply the following configuration only to TypeScript and JavaScript files
    files: ['**/*.ts', '**/*.js'],

    // Extend recommended rule sets
    extends: [
      // ESLint's recommended JavaScript rules
      eslint.configs.recommended,

      // TypeScript ESLint recommended rules
      ...tseslint.configs.recommended,
    ],

    rules: {
      // Allow the use of the non-null assertion operator (!)
      // Example: someValue!.property
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Disallow @ts-ignore and other TypeScript comment directives
      // unless explicitly allowed
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },

  // Adds Prettier integration so formatting issues appear as ESLint errors
  eslintPluginPrettierRecommended,
);
