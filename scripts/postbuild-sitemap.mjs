/**
 * Runs next-sitemap postbuild when the package is installed.
 * Native `app/sitemap.ts` + `app/robots.ts` always serve SEO routes; this augments `public/` for static hosts.
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nextSitemapBin = join(root, "node_modules", "next-sitemap", "bin", "next-sitemap.mjs");

if (!existsSync(nextSitemapBin)) {
  console.log("[postbuild] next-sitemap not installed — skipping (app/sitemap.ts serves sitemap.xml).");
  process.exit(0);
}

const result = spawnSync(process.execPath, [nextSitemapBin], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
