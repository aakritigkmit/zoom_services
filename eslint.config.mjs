export default [
    {
        languageOptions: {
            globals: {
                module: 'readonly',
                require: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
            },
            parserOptions: {
                ecmaVersion: 12,// ES2021
                sourceType: 'module', // Allow using imports
            },
        },
        rules: {
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': 'error',
            'curly': 'error',
            'semi': ['error', 'always'],
            // 'quotes': ['error', 'single'],
            'no-multi-spaces': 'error',
            // 'space-before-function-paren': ['error', 'never'],
            'arrow-spacing': ['error', { before: true, after: true }],
            'max-len': ['error', { code: 150 }],
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'consistent-return': 'error',
            'no-duplicate-imports': 'error',
            'prefer-template': 'error',
        },
    },
];




