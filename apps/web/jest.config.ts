import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
  moduleNameMapper: {
    "^@etz/shared-types$": "<rootDir>/../../packages/shared-types/src/index.ts",
    "^@etz/shared-types/(.*)$": "<rootDir>/../../packages/shared-types/src/$1",
  },
};

export default config;
