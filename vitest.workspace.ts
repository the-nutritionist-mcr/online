import { readdirSync, statSync } from "fs";
import { join } from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import { UserWorkspaceConfig, defineWorkspace } from "vitest/config";

const SRC = join(__dirname, "src");

const files = readdirSync(SRC);

const upperCase = (text: string) =>
  `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

const exclude = ["test-support", "styles", "assets"];

const defaultConfig = (name: string, path: string): UserWorkspaceConfig => {
  return {
    plugins: [tsconfigPaths()],
    test: {
      globals: true,
      name: upperCase(name),
      setupFiles: ["src/test-support/setup-tests.ts", "jest-extended/all"],
      include: [`${path}/**/*.spec.{ts,tsx}`],
      environment: "node",
    },
  };
};

const projects: Record<string, UserWorkspaceConfig> = {
  components: {
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: "jsdom",
    },
  },
  "admin-app": {
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: "jsdom",
    },
  },
  pages: {
    plugins: [tsconfigPaths(), react()],
    test: {
      environment: "jsdom",
    },
  },
};

const workspaces = files
  .filter((file) => !exclude.includes(file))
  .filter((file) => {
    const path = join(SRC, file);
    const stat = statSync(path);
    return stat.isDirectory();
  })
  .map((file) => {
    const path = join(SRC, file);
    const config = defaultConfig(file, path);
    if (file in projects) {
      return {
        plugins: [...(config.plugins ?? []), ...(projects[file].plugins ?? [])],
        test: { ...config.test, ...projects[file].test },
      };
    }
    return config;
  });

export default defineWorkspace(workspaces);
