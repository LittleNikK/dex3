import { createDefaultPreset } from "ts-jest";

const presetConfig = createDefaultPreset({
  tsconfig: {
    module: "CommonJS",
    moduleResolution: "node",
    target: "ES2022"
  }
});

export default {
  ...presetConfig,
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  }
};
