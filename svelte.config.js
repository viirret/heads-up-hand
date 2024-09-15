import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
      		assets: 'build',
      		fallback: null
		}),

		paths: {
      		base: process.env.BASE_PATH || ''  // Fallback to an empty string if the environment variable is not set
    	}
	}
};

export default config;
