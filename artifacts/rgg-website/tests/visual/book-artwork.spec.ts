import { expect, test, type Page } from "@playwright/test";

const views = ["front", "spine", "back"] as const;

async function collectRenderingFailures(page: Page) {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    const text = message.text();
    if (
      message.type() === "error" ||
      /\b(?:webgl|three\.webglrenderer)\b.*\b(?:error|failed|lost|unsupported)\b/i.test(
        text,
      )
    ) {
      failures.push(`console.${message.type()}: ${text}`);
    }
  });
  return failures;
}

for (const view of views) {
  test(`${view} artwork has the approved orientation and face assignment`, async ({
    page,
  }) => {
    const renderingFailures = await collectRenderingFailures(page);
    await page.goto(`/book?book-visual-test=${view}`, {
      waitUntil: "domcontentloaded",
    });

    const viewer = page.getByTestId("book-3d-viewer");
    await expect(viewer).toHaveAttribute("data-book-view", view);
    await expect(viewer).toHaveAttribute("data-viewer-ready", "true", {
      timeout: 20_000,
    });
    await expect(viewer.locator("canvas")).toBeVisible();
    await expect(viewer).toHaveScreenshot(`book-${view}.png`);
    expect(renderingFailures, renderingFailures.join("\n")).toEqual([]);
  });
}