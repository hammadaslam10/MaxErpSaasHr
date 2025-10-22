module.exports = {
  root: true,
  strict: false,
  parser: '@typescript-eslint/parser',
  parserOptions: {
  // Points to your NestJS project's tsconfig
  project: ['./tsconfig.json'],
  tsconfigRootDir: __dirname,
  sourceType: 'module',
  },
  env: {
  node: true, // Because NestJS runs on Node
  jest: true, // For unit/integration tests
  },
  ignorePatterns: [
  // Ignore build output, node_modules, etc.
  'dist',
  'node_modules',
  '.eslintrc.js',
  ],
  extends: [
  'plugin:@typescript-eslint/recommended',
  'plugin:prettier/recommended', // Integrates Prettier for formatting
  ],
  plugins: [
  '@typescript-eslint',
  'import',
  ],
  rules: {
  /*
  
      General Rules
      */
      // Disallow console.log statements (use Nest's logger instead)
      'no-console': 'error',
  
  // Enforce single quotes (allowing escape when necessary)
  quotes: ['error', 'single', { avoidEscape: true }],
  
  // 2-space indentation
  indent: ['error', 2, { SwitchCase: 1 }],
  
  // Restrict maximum line length to 120 characters
  'max-len': ['error', { code: 120 }],
  
  /**
  
      Import Rules
      */
      // Enforce consistent import ordering
      'import/order': [
      'error',
      {
      groups: [
      'builtin',
      'external',
      'internal',
      'parent',
      'sibling',
      'index',
      'object',
      'type',
      ],
      'newlines-between': 'always',
      alphabetize: {
      order: 'asc',
      caseInsensitive: true,
      },
      },
      ],
  
  /**
  
      TypeScript-Specific Rules
      */
      // Allow or disallow the any type
      '@typescript-eslint/no-explicit-any': 'off',
  
  // Require explicit return types on exported functions
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  
  // Example naming convention rules
  '@typescript-eslint/naming-convention': [
  'error',
  {
  // Enforce PascalCase for type aliases
  selector: 'typeAlias',
  format: ['PascalCase'],
  },
  {
  // Enforce PascalCase for interfaces but disallow the I prefix
  selector: 'interface',
  format: ['PascalCase'],
  custom: {
  regex: '^I[A-Z]',
  match: false,
  },
  },
  ],
  
  // Prefer using interfaces over type aliases for object type definitions
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  },
  overrides: [
  {
  // For test files (.spec or .test), we can add or remove rules as needed
  files: ['.spec.ts', '.test.ts'],
  env: {
  jest: true,
  },
  rules: {
  // For example, you might allow console logs in test files
  'no-console': 'off',
  },
  },
  {
  // For declaration files
  files: ['*.d.ts'],
  rules: {
  // Disallow certain patterns in .d.ts files
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-empty-interface': 'error',
  '@typescript-eslint/no-namespace': 'error',
  '@typescript-eslint/triple-slash-reference': 'error',
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  },
  },
  ],
  };