import {
  expect,
  test,
  type BrowserName,
  type CDPSession,
  type Locator,
  type Page,
} from "@playwright/test";

async function openReadyViewer(page: Page, reducedMotion: "reduce" | "no-preference") {
  await page.emulateMedia({ reducedMotion });
  await page.goto("/book?book-interaction-test=1", {
    waitUntil: "domcontentloaded",
  });
  const viewer = page.getByTestId("book-3d-viewer");
  await expect(viewer).toHaveAttribute("data-viewer-ready", "true", {
    timeout: 20_000,
  });
  await expect(viewer).toHaveAttribute("data-target-rotation", /.+/);
  return viewer;
}

async function targetRotation(viewer: Locator) {
  return Number(await viewer.getAttribute("data-target-rotation"));
}

async function drag(
  viewer: Locator,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  await viewer.dispatchEvent("pointerdown", {
    pointerId: 1,
    pointerType: "touch",
    isPrimary: true,
    buttons: 1,
    clientX: from.x,
    clientY: from.y,
  });
  await viewer.dispatchEvent("pointermove", {
    pointerId: 1,
    pointerType: "touch",
    isPrimary: true,
    buttons: 1,
    clientX: to.x,
    clientY: to.y,
  });
  await viewer.dispatchEvent("pointerup", {
    pointerId: 1,
    pointerType: "touch",
    isPrimary: true,
    clientX: to.x,
    clientY: to.y,
  });
}

async function nativeTouchDrag(
  page: Page,
  client: CDPSession,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const point = (x: number, y: number) => ({
    x,
    y,
    id: 1,
    radiusX: 1,
    radiusY: 1,
    force: 1,
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [point(from.x, from.y)],
  });
  for (let step = 1; step <= 8; step += 1) {
    const progress = step / 8;
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        point(
          from.x + (to.x - from.x) * progress,
          from.y + (to.y - from.y) * progress,
        ),
      ],
    });
    await page.waitForTimeout(16);
  }
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
}

test("horizontal touch drag rotates the book and pauses idle rotation", async ({
  browserName,
  page,
}) => {
  const viewer = await openReadyViewer(page, "no-preference");
  await viewer.scrollIntoViewIfNeeded();
  const client =
    browserName === "chromium"
      ? await page.context().newCDPSession(page)
      : undefined;
  await expect(viewer).toHaveAttribute("data-auto-rotating", "true", {
    timeout: 5_000,
  });
  const before = await targetRotation(viewer);

  const box = await viewer.boundingBox();
  if (!box) throw new Error("Book viewer has no visible bounding box");
  const from = { x: box.x + box.width * 0.25, y: box.y + box.height / 2 };
  const to = { x: box.x + box.width * 0.75, y: box.y + box.height / 2 + 5 };
  if (client) {
    await nativeTouchDrag(page, client, from, to);
    await client.detach();
  } else {
    await drag(viewer, from, to);
  }

  await expect.poll(() => targetRotation(viewer)).toBeGreaterThan(before + 0.5);
  await expect(viewer).toHaveAttribute("data-auto-rotating", "false");
});

test("vertical gestures retain native page scrolling", async ({
  browserName,
  page,
}) => {
  const viewer = await openReadyViewer(page, "reduce");
  await expect(viewer).toHaveCSS("touch-action", "pan-y");
  test.skip(
    browserName !== "chromium",
    "Playwright WebKit cannot generate a native touch swipe; Android provides native-scroll coverage",
  );

  await viewer.scrollIntoViewIfNeeded();
  const client = await page.context().newCDPSession(page);
  const box = await viewer.boundingBox();
  if (!box) throw new Error("Book viewer has no visible bounding box");
  await drag(
    viewer,
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );
  const beforeRotation = await targetRotation(viewer);
  const beforeScroll = await page.evaluate(() => window.scrollY);
  await nativeTouchDrag(
    page,
    client,
    { x: box.x + box.width / 2, y: box.y + box.height * 0.7 },
    { x: box.x + box.width / 2, y: box.y + box.height * 0.3 },
  );
  await client.detach();

  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(beforeScroll);
  expect(await targetRotation(viewer)).toBeCloseTo(beforeRotation, 5);
});

test("reduced motion prevents automatic rotation", async ({ page }) => {
  const viewer = await openReadyViewer(page, "reduce");
  const before = await targetRotation(viewer);

  await page.waitForTimeout(3_500);

  await expect(viewer).toHaveAttribute("data-auto-rotating", "false");
  expect(await targetRotation(viewer)).toBeCloseTo(before, 5);
});