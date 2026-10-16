import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // GitHub Pages serves this repository under /nprep/.
  ...(process.env.GITHUB_PAGES === "true"
    ? { output: "export", basePath: "/nprep", trailingSlash: true }
    : {}),
  // Keep the local review surface free of development overlays.
  devIndicators: false,
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};
export default nextConfig;
