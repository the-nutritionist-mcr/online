import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    include: ["src/**/*.spec.ts"],
    setupFiles: ["src/test-support/setup-tests.ts"],
    coverage: {
      all: true,
      include: ["src/**/*.ts"],
      provider: "istanbul",
      thresholdAutoUpdate: true,
      functions: 31.11,
      lines: 27.17,
      statements: 27.36,
      branches: 28.24,
    },
  },
});
