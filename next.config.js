// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createVanillaExtractPlugin } = require("@vanilla-extract/next-plugin");
const withVanillaExtract = createVanillaExtractPlugin();
const withOptimizedImages = require("next-optimized-images");

const withPWA = require("next-pwa")({
  dest: "public",
  cacheOnFrontEndNav: true,
  cacheStartUrl: true,
  dynamicStartUrlRedirect: true,
  runtimeCaching: [
    {
      handler: "StaleWhileRevalidate",
      urlPattern: /\.manifest\.json/,
    },
    {
      handler: "StaleWhileRevalidate",
      urlPattern: "/_next",
    },
    {
      handler: "StaleWhileRevalidate",
      urlPattern: "/account",
    },
    {
      handler: "StaleWhileRevalidate",
      urlPattern: "/login",
    },
    {
      handler: "StaleWhileRevalidate",
      urlPattern: "/choose-meals",
    },
  ],
});

module.exports = withVanillaExtract(
  withOptimizedImages(
    withPWA({
      output: "export",
      outputFileTracing: false,
      env: {
        APP_VERSION: process.env.APP_VERSION,
      },
      trailingSlash: true,
      pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
      generateBuildId: async () => {
        return process.env.APP_VERSION;
      },

      typescript: {
        ignoreBuildErrors: true,
      },
      productionBrowserSourceMaps: true,
      webpack: (config, nextConfig) => {
        // // eslint-disable-next-line fp/no-mutating-methods
        // config.plugins.push(new GenerateAwsLambda(nextConfig));
        if (!nextConfig.isServer) {
          // eslint-disable-next-line fp/no-mutation
          config.resolve.fallback.fs = false;
        }
        return config;
      },
      images: {
        disableStaticImages: true,
        loader: "custom",
      },
    })
  )
);
