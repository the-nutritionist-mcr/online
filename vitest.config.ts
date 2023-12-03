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
      provider: "istanbul",
      thresholdAutoUpdate: true,
      functions: 23.01,
      lines: 30.56,
      statements: 29.96,
      branches: 23.28,
    },
  },
});
