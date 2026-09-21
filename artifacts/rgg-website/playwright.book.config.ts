import { defineConfig, devices } from "@playwright/test";

const swiftShaderLaunchOptions = {
  args: [
    "--enable-unsafe-swiftshader",
    "--use-angle=swiftshader-webgl",
    "--use-gl=angle",
  ],
};

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{ext}",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4173",
    colorScheme: "dark",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "book-artwork",
      testMatch: "book-artwork.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        deviceScaleFactor: 1,
        launchOptions: swiftShaderLaunchOptions,
        reducedMotion: "reduce",
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "book-editions-desktop",
      testMatch: "book-editions.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        reducedMotion: "reduce",
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "book-editions-mobile",
      testMatch: "book-editions.spec.ts",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        reducedMotion: "reduce",
      },
    },
    {
      name: "iOS Safari",
      testMatch: "book-mobile-gestures.spec.ts",
      use: {
        ...devices["iPhone 13"],
        browserName: "webkit",
      },
    },
    {
      name: "Android Chrome",
      testMatch: "book-mobile-gestures.spec.ts",
      use: {
        ...devices["Pixel 7"],
        browserName: "chromium",
        launchOptions: swiftShaderLaunchOptions,
      },
    },
  ],
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.005,
      scale: "css",
    },
  },
  webServer: {
    command:
      "PORT=4173 BASE_PATH=/ pnpm --filter @workspace/rgg-website run dev",
    url: "http://127.0.0.1:4173/book?book-visual-test=front",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
