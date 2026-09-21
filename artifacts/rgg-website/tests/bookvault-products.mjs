import editions from "../src/content/bookEditions.json" with { type: "json" };
import { pathToFileURL } from "node:url";

const REQUEST_TIMEOUT_MS = 20_000;
const MAX_APPROVED_REDIRECTS = 5;

export async function checkEdition(edition) {
  let currentUrl = edition.href;
  const approvedRedirects = new Set(edition.approvedRedirects);

  for (let redirectCount = 0; redirectCount <= MAX_APPROVED_REDIRECTS; redirectCount += 1) {
    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "user-agent": "RGG-BookVault-Link-Checker/1.0",
        accept: "text/html",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    await response.body?.cancel();

    if (response.ok) {
      return;
    }

    if (response.status < 300 || response.status >= 400) {
      throw new Error(`returned HTTP ${response.status} at ${currentUrl}`);
    }

    const location = response.headers.get("location");
    if (!location) {
      throw new Error(`returned HTTP ${response.status} without a Location header`);
    }

    const destination = new URL(location, currentUrl).href;
    if (!approvedRedirects.has(destination)) {
      throw new Error(
        `redirected to unapproved destination ${destination} (HTTP ${response.status})`,
      );
    }

    currentUrl = destination;
  }

  throw new Error(`exceeded ${MAX_APPROVED_REDIRECTS} approved redirects`);
}

export async function checkEditions(editionsToCheck) {
  const results = await Promise.allSettled(editionsToCheck.map(checkEdition));

  return results.flatMap((result, index) =>
    result.status === "rejected"
      ? [
          `${editionsToCheck[index].language} ${editionsToCheck[index].format}: ${
            result.reason instanceof Error ? result.reason.message : String(result.reason)
          }`,
        ]
      : [],
  );
}

async function runLiveCheck() {
  const failures = await checkEditions(editions);

  if (failures.length > 0) {
    console.error("BookVault product availability check failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`Verified ${editions.length} BookVault product pages.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runLiveCheck();
}