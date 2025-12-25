import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr"; // Import the svgr plugin

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), svgr()], // Add svgr to the plugins array
	base: "/",
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// Separate React and ReactDOM into their own chunk
					"react-vendor": ["react", "react-dom"],
					// Separate Three.js and postprocessing into their own chunk
					"three-vendor": ["three", "postprocessing"],
					// Separate other vendor libraries
					vendor: [
						"react-router-dom",
						"lucide-react",
						"clsx",
						"tailwind-merge",
					],
				},
			},
		},
		// Increase chunk size warning limit to 600kb since we're splitting properly
		chunkSizeWarningLimit: 600,
	},
});
