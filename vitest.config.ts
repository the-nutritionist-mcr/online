import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    globals: true,
    include: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
    setupFiles: ["src/test-support/setup-tests.ts"],
    pool: "forks",
    coverage: {
      all: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/test-support/**/*"],
      provider: "istanbul",
      thresholdAutoUpdate: false,
      functions: 23.0,
      lines: 30.8,
      statements: 30.3,
      branches: 22.8,
    },
  },
});
