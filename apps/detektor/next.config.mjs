/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Schlankes Runtime-Image fuer Docker (server.js + nur benoetigte Deps).
  output: "standalone",
  webpack: (config) => {
    // Die Engine nutzt NodeNext-Importe (./x.js -> x.ts). Webpack soll .js auf
    // die TypeScript-Quelle auflösen, damit die App die Engine direkt einbindet.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
