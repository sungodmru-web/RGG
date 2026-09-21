import { expect, test } from "@playwright/test";
import bookEditions from "../../src/content/bookEditions.json" with { type: "json" };

const editions = bookEditions.map((edition) => ({
  ...edition,
  title: `${edition.language} Edition`,
}));

test("Buy Now gallery pairs every edition with its intended BookVault product", async ({
  page,
}) => {
  await page.goto("/book?book-editions-test=1", {
    waitUntil: "domcontentloaded",
  });

  const gallery = page.locator("#editions");
  await expect(gallery).toBeVisible();

  for (const edition of editions) {
    const card = gallery.locator(`[data-edition="${edition.id}"]`);
    await expect(card.getByRole("heading", { name: edition.title })).toBeVisible();
    await expect(card.getByText(edition.format, { exact: true })).toBeVisible();
    await expect(card.locator("img")).toBeVisible();
    await expect(card.getByRole("link", { name: "Buy Now" })).toHaveAttribute(
      "href",
      edition.href,
    );
  }

  const comicCard = gallery.locator('[data-edition="english-comic"]');
  await expect(comicCard.getByRole("button", { name: "Buy Now" })).toBeDisabled();
});