module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
<<<<<<< Updated upstream
    project: 'tsconfig.json',
    tsconfigRootDir : __dirname, 
=======
    project: "tsconfig.json",
>>>>>>> Stashed changes
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
<<<<<<< Updated upstream
  ignorePatterns: ['.eslintrc.js'],
=======
  ignorePatterns: ["tsconfig.json"],
>>>>>>> Stashed changes
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};