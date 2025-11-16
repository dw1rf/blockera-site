import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    testTimeout: 15000,
    coverage: {
      reporter: ["text", "lcov"]
    }
  }
});
