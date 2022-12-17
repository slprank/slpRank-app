import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	server: {
		origin: 'https://localhost:3000'
	},
	plugins: [sveltekit()]
};

export default config;
