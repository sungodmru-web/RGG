import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import type { Plugin } from "vite";

import {
  bookJsonLd,
  globalJsonLd,
  metadataForPublication,
  publicationJsonLd,
  PUBLIC_ROUTE_PATHS,
  ROUTE_METADATA,
  validateJsonLd,
  type JsonLd,
  type PageMetadata,
} from "./src/lib/pageMetadata";
import type { ResearchPublication } from "./src/types/research";

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;
const replitDeploymentOrigin = process.env.REPLIT_DOMAINS
  ?.split(",")
  .map((domain) => domain.trim())
  .find(Boolean);
const siteOrigin =
  process.env.PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  (replitDeploymentOrigin ? `https://${replitDeploymentOrigin}` : undefined) ??
  (process.env.NODE_ENV !== "production" ? `http://localhost:${port}` : undefined);

if (!siteOrigin) {
  throw new Error(
    "PUBLIC_SITE_URL is required for production builds outside Replit.",
  );
}
const publicationsApiUrl =
  process.env.PUBLICATIONS_API_URL ??
  new URL("/api/publications", siteOrigin).href;

if (!basePath) {
  throw new Error(
    "BASE_PATH environment variable is required but was not provided.",
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function serializeJsonLd(value: JsonLd): string {
  validateJsonLd(value);
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function renderMetadata(
  html: string,
  route: string,
  metadata: PageMetadata,
  bodyContent: string,
  robots = "index, follow",
  routeJsonLd: JsonLd[] = [],
): string {
  const routePath = `${basePath.replace(/\/$/, "")}${route}` || "/";
  const canonicalPath =
    routePath === "/" || routePath.endsWith("/") ? routePath : `${routePath}/`;
  const routeUrl = new URL(canonicalPath, siteOrigin).href;
  const replacements: Array<[RegExp, string]> = [
    [/<title>.*?<\/title>/s, `<title>${escapeHtml(metadata.title)}</title>`],
    [/<meta name="description" content=".*?" \/>/s, `<meta name="description" content="${escapeHtml(metadata.description)}" />`],
    [/<meta name="robots" content=".*?" \/>/s, `<meta name="robots" content="${robots}" />`],
    [/<meta property="og:title" content=".*?" \/>/s, `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`],
    [/<meta property="og:description" content=".*?" \/>/s, `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`],
    [/<meta property="og:type" content=".*?" \/>/s, `<meta property="og:type" content="${metadata.type ?? "website"}" />`],
    [/<meta property="og:url" content=".*?" \/>/s, `<meta property="og:url" content="${routeUrl}" />`],
    [/<meta property="og:image" content=".*?" \/>/s, `<meta property="og:image" content="${new URL(`${basePath.replace(/\/$/, "")}/opengraph.jpg`, siteOrigin).href}" />`],
    [/<meta name="twitter:title" content=".*?" \/>/s, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`],
    [/<meta name="twitter:description" content=".*?" \/>/s, `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`],
    [/<meta name="twitter:image" content=".*?" \/>/s, `<meta name="twitter:image" content="${new URL(`${basePath.replace(/\/$/, "")}/opengraph.jpg`, siteOrigin).href}" />`],
    [/<link rel="canonical" href=".*?"(?: \/)?>/s, `<link rel="canonical" href="${routeUrl}" />`],
    [/<div id="root"><\/div>/s, `<div id="root">${bodyContent}</div>`],
  ];
  const rendered = replacements.reduce(
    (document, [pattern, replacement]) => document.replace(pattern, replacement),
    html,
  );
  const withCanonical = rendered.includes('rel="canonical"')
    ? rendered
    : rendered.replace(
        "</head>",
        `    <link rel="canonical" href="${routeUrl}" />\n  </head>`,
      );
  const jsonLd = [...globalJsonLd(siteOrigin), ...routeJsonLd]
    .map(
      (value) =>
        `    <script type="application/ld+json">${serializeJsonLd(value)}</script>`,
    )
    .join("\n");
  return withCanonical.replace("</head>", `${jsonLd}\n  </head>`);
}

function renderRouteContent(route: string, metadata: PageMetadata): string {
  const links = PUBLIC_ROUTE_PATHS.map((path) => {
    const routePath = `${basePath.replace(/\/$/, "")}${path}` || "/";
    const href = new URL(
      routePath === "/" || routePath.endsWith("/") ? routePath : `${routePath}/`,
      siteOrigin,
    ).href;
    return `<li><a href="${href}">${escapeHtml(ROUTE_METADATA[path].title)}</a></li>`;
  }).join("");
  return `<main><article><h1>${escapeHtml(metadata.title.split(" | ")[0])}</h1><p>${escapeHtml(metadata.description)}</p></article><nav aria-label="Public pages"><ul>${links}</ul></nav></main>`;
}

function renderPublicationContent(publication: ResearchPublication): string {
  const metadata = metadataForPublication(publication);
  const authors = publication.authors.map((author) => escapeHtml(author.name)).join(", ");
  return `<main><article><header><h1>${escapeHtml(publication.title)}</h1>${publication.subtitle ? `<p>${escapeHtml(publication.subtitle)}</p>` : ""}<p>${authors}</p></header><p>${escapeHtml(publication.abstract)}</p>${publication.content ? `<div>${escapeHtml(publication.content)}</div>` : ""}</article></main>`;
}

function prerenderPublicMetadata(): Plugin {
  return {
    name: "prerender-public-metadata",
    apply: "build",
    async writeBundle(options) {
      if (!options.dir) {
        this.error("Vite did not provide an output directory for route prerendering.");
        return;
      }
      const indexPath = path.join(options.dir, "index.html");
      const entry = await readFile(indexPath, "utf8");
      const publicationResponse = await fetch(publicationsApiUrl, {
        headers: { accept: "application/json" },
      });
      if (!publicationResponse.ok) {
        this.error(
          `Could not load published publication metadata (${publicationResponse.status}).`,
        );
        return;
      }
      const publicationPayload: unknown = await publicationResponse.json();
      if (!Array.isArray(publicationPayload)) {
        this.error("Published publication metadata was not an array.");
        return;
      }
      const publications = publicationPayload as ResearchPublication[];
      const publicationSlugs = new Set<string>();
      for (const publication of publications) {
        if (publicationSlugs.has(publication.slug)) {
          this.error(
            `Published publication metadata contains duplicate slug "${publication.slug}".`,
          );
          return;
        }
        publicationSlugs.add(publication.slug);
      }
       for (const route of PUBLIC_ROUTE_PATHS) {
         const metadata = ROUTE_METADATA[route];
        const filePath =
          route === "/"
            ? indexPath
            : path.join(options.dir, route.slice(1), "index.html");
        await mkdir(path.dirname(filePath), { recursive: true });
          await writeFile(
            filePath,
            renderMetadata(
              entry,
              route,
              metadata,
              renderRouteContent(route, metadata),
              "index, follow",
              route === "/book" ? [bookJsonLd(siteOrigin)] : [],
            ),
          );
      }
      for (const publication of publications) {
        if (
          !publication.slug ||
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(publication.slug)
        ) {
          this.error("A published publication has an invalid prerender slug.");
          return;
        }
         const route = `/publications/${publication.slug}`;
        const filePath = path.join(
          options.dir,
           "publications",
          publication.slug,
          "index.html",
        );
        await mkdir(path.dirname(filePath), { recursive: true });
        await writeFile(
          filePath,
           renderMetadata(
             entry,
             route,
             metadataForPublication(publication),
             renderPublicationContent(publication),
             "index, follow",
             [publicationJsonLd(publication, siteOrigin)],
           ),
        );
      }
       for (const route of ["/admin", "/sign-in", "/sign-up"]) {
         const filePath = path.join(options.dir, route.slice(1), "index.html");
         await mkdir(path.dirname(filePath), { recursive: true });
         await writeFile(
           filePath,
           renderMetadata(
             entry,
             route,
             { title: `Private Access | Reclaiming the Green Gold`, description: "Private publishing access." },
             "<main><h1>Private access</h1></main>",
             "noindex, nofollow",
           ),
         );
       }
      const sitemapRoutes = [
         ...PUBLIC_ROUTE_PATHS,
         ...publications.map((publication) => `/publications/${publication.slug}`),
      ];
      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...sitemapRoutes.map((route) => {
          const routePath = `${basePath.replace(/\/$/, "")}${route}` || "/";
           const sitemapPath =
             routePath === "/" || routePath.endsWith("/")
               ? routePath
               : `${routePath}/`;
           return `  <url><loc>${new URL(sitemapPath, siteOrigin).href}</loc></url>`;
        }),
        "</urlset>",
        "",
      ].join("\n");
      await writeFile(path.join(options.dir, "sitemap.xml"), sitemap);
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    prerenderPublicMetadata(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
