import js from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('typescript-eslint').ConfigArray} */
const config = tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/drizzle/**',
      '**/node_modules/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);

export default config;
