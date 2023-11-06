import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    api: true,
    globals: true,
    include: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
    setupFiles: ["src/test-support/setup-tests.ts"],
    coverage: {
      all: true,
      include: ["src/**/*.ts", "src/**/*.tsx"],
      provider: "istanbul",
      thresholdAutoUpdate: true,
      functions: 24.37,
      lines: 31.57,
      statements: 30.79,
      branches: 23.61,
    },
  },
});
