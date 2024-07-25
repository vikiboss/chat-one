import react from "@vitejs/plugin-react-swc";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [UnoCSS(), react()],
	define: {
		__WS_URL__: JSON.stringify(process.env.WS_URL),
	},
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});
