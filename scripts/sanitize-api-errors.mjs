/**
 * One-off codemod: replace raw err.message in player-facing API routes with safeApiErrorMessage.
 */
import fs from "fs";
import path from "path";

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (e.name === "route.ts") files.push(p);
  }
  return files;
}

const skip = /[\\/](admin|cron|connect-sample|webhooks)[\\/]/;

function inferContext(filePath, fallback = "") {
  const f = filePath.replace(/\\/g, "/").toLowerCase();
  const fb = fallback.toLowerCase();
  if (f.includes("checkout") || fb.includes("checkout")) return "checkout";
  if (f.includes("/join") || fb.includes("join")) return "join";
  if (f.includes("redeem") || f.includes("referral") || fb.includes("redeem")) return "redeem";
  if (f.includes("withdraw")) return "withdraw";
  if (f.includes("deposit")) return "deposit";
  if (f.includes("huddle") || fb.includes("share") || fb.includes("publish")) return "share";
  if (
    f.includes("/picks") ||
    f.includes("tiebreaker") ||
    f.includes("/claim") ||
    fb.includes("save pick") ||
    fb.includes("save prediction") ||
    fb.includes("claim")
  )
    return "save";
  if (
    f.includes("/profile") ||
    f.includes("username") ||
    f.includes("player-card") ||
    f.includes("customization") ||
    f.includes("showcase") ||
    f.includes("identity") ||
    fb.includes("update") ||
    fb.includes("save")
  )
    return "save";
  if (f.includes("leagues") && (fb.includes("create") || fb.includes("could not create")))
    return "create";
  if (
    fb.includes("load") ||
    fb.includes("failed to load") ||
    fb.includes("could not load") ||
    f.includes("hall-of-fame") ||
    f.includes("overview") ||
    f.includes("/week") ||
    f.includes("scoreboard") ||
    f.includes("bracket") ||
    f.includes("/hub")
  )
    return "load";
  if (f.includes("mystery-box") || f.includes("weekly-drop") || f.includes("promotions"))
    return "redeem";
  if (f.includes("premium-emojis") || f.includes("pending-rewards")) return "checkout";
  return "generic";
}

function addImport(content) {
  if (content.includes("safeApiErrorMessage") || content.includes("formatUserError")) {
    if (!content.includes("safeApiErrorMessage") && content.includes("formatUserError")) {
      return content.replace(
        /import \{ formatUserError \} from "@\/lib\/errors\/formatUserError";/,
        'import { formatUserError, safeApiErrorMessage } from "@/lib/errors/formatUserError";'
      );
    }
    if (!content.includes('from "@/lib/errors/formatUserError"')) {
      const importLine =
        'import { safeApiErrorMessage } from "@/lib/errors/formatUserError";\n';
      const nextImport = content.match(/^import .+$/m);
      if (nextImport) {
        return content.replace(nextImport[0], `${importLine}${nextImport[0]}`);
      }
      return importLine + content;
    }
    return content;
  }
  const importLine = 'import { safeApiErrorMessage } from "@/lib/errors/formatUserError";\n';
  const nextImport = content.match(/^import .+$/m);
  if (nextImport) {
    return content.replace(nextImport[0], `${importLine}${nextImport[0]}`);
  }
  return importLine + content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  if (!/(error|err)\.message/.test(content)) return false;

  const original = content;

  // Multiline: err instanceof Error ? err.message : "fallback"
  content = content.replace(
    /err instanceof Error\s*\?\s*err\.message\s*:\s*"([^"]*)"/g,
    (_, fallback) => `safeApiErrorMessage(err, "${inferContext(filePath, fallback)}")`
  );

  // const message = err instanceof Error ? err.message : "..."
  content = content.replace(
    /const message = safeApiErrorMessage\(err, "[^"]+"\);/g,
    (m) => m
  );

  // Supabase error.message in JSON responses (not auth.updateUser validation we handle separately)
  content = content.replace(
    /return NextResponse\.json\(\{ error: error\.message \}/g,
    'return NextResponse.json({ error: safeApiErrorMessage(error, "' +
      inferContext(filePath) +
      '") }'
  );

  // usernameError assignment
  content = content.replace(
    /usernameError = err instanceof Error \? err\.message : "([^"]*)";/g,
    (_, fallback) =>
      `usernameError = safeApiErrorMessage(err, "${inferContext(filePath, fallback)}");`
  );

  // Remaining error.message in catch when variable is err (already handled above mostly)

  if (content !== original) {
    content = addImport(content);
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

const routes = walk("app/api").filter((p) => !skip.test(p));
let updated = 0;
for (const route of routes) {
  if (processFile(route)) {
    updated++;
    console.log("updated:", route);
  }
}
console.log(`Done. Updated ${updated} files.`);
