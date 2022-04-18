module.exports = {
	// https://github.com/prettier/eslint-config-prettier
	extends: ['prettier'],
	// https://github.com/prettier/eslint-plugin-prettier
	plugins: ['prettier'],
	env: {
		es6: true
	},
	parserOptions: {
		ecmaVersion: 2018
	},
	rules: {
		'prettier/prettier': 'error',
		'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }]
	}
}
