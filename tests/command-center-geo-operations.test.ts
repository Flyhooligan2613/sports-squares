import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  COMMAND_CENTER_NAV,
  canAccessSection,
  navItemsForRole,
  parseCommandCenterRoleMap,
} from "../lib/platform/engines/commandCenter/config";
import type {
  CommandCenterRole,
  CommandCenterSectionId,
} from "../lib/platform/engines/commandCenter/types";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const geoOperationsSection: CommandCenterSectionId = "geo-operations";
const geoOperationsAdminPath = "/admin/command-center/geo-operations";
const allRoles: CommandCenterRole[] = [
  "support",
  "finance",
  "compliance",
  "marketing",
  "operations",
  "executive",
  "engineering",
];

async function parseSourceFile(relativePath: string) {
  const filePath = path.join(projectRoot, relativePath);
  const source = await readFile(filePath, "utf8");
  return ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function collectStringLiteralCalls(sourceFile: ts.SourceFile, calleeName: string) {
  const values: string[] = [];

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === calleeName
    ) {
      const [firstArg] = node.arguments;
      if (firstArg && ts.isStringLiteralLike(firstArg)) {
        values.push(firstArg.text);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return values;
}

function callIncludesStringLiteral(
  sourceFile: ts.SourceFile,
  calleeName: string,
  expected: string
) {
  let found = false;

  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === calleeName &&
      node.arguments.some((arg) => ts.isStringLiteralLike(arg) && arg.text === expected)
    ) {
      found = true;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return found;
}

test("Geo Operations is exposed only through the intended Command Center roles", () => {
  const geoNavItem = COMMAND_CENTER_NAV.find((item) => item.id === geoOperationsSection);

  assert.ok(geoNavItem, "Geo Operations nav item should be registered");
  assert.equal(geoNavItem.href, geoOperationsAdminPath);
  assert.deepEqual(geoNavItem.roles, ["compliance", "operations", "executive"]);

  const allowedRoles = allRoles.filter((role) => canAccessSection(role, geoOperationsSection));
  assert.deepEqual(allowedRoles, ["compliance", "operations", "executive"]);

  for (const role of allowedRoles) {
    assert.ok(
      navItemsForRole(role).some((item) => item.id === geoOperationsSection),
      `${role} should see Geo Operations in Command Center navigation`
    );
  }

  for (const role of allRoles.filter((role) => !allowedRoles.includes(role))) {
    assert.ok(
      !navItemsForRole(role).some((item) => item.id === geoOperationsSection),
      `${role} should not see Geo Operations in Command Center navigation`
    );
  }
});

test("role-map parsing normalizes admin emails and drops invalid role assignments", (t) => {
  const originalRoleMap = process.env.COMMAND_CENTER_ROLE_MAP;
  t.after(() => {
    if (originalRoleMap === undefined) {
      delete process.env.COMMAND_CENTER_ROLE_MAP;
    } else {
      process.env.COMMAND_CENTER_ROLE_MAP = originalRoleMap;
    }
  });

  process.env.COMMAND_CENTER_ROLE_MAP = JSON.stringify({
    " Ops@Example.COM ": "operations",
    "support@example.com": "support",
    "marketing@example.com": "root",
  });

  assert.deepEqual(parseCommandCenterRoleMap(), {
    "ops@example.com": "operations",
    "support@example.com": "support",
  });

  process.env.COMMAND_CENTER_ROLE_MAP = "{not valid json";
  assert.deepEqual(parseCommandCenterRoleMap(), {});

  delete process.env.COMMAND_CENTER_ROLE_MAP;
  assert.deepEqual(parseCommandCenterRoleMap(), {});
});

test("legacy Geo Operations routes redirect into the Admin Command Center", async () => {
  const legacyRouteFiles = [
    "app/ops/geo-operations/page.tsx",
    "app/ops/geo-compliance/page.tsx",
  ];

  for (const routeFile of legacyRouteFiles) {
    const sourceFile = await parseSourceFile(routeFile);
    assert.deepEqual(
      collectStringLiteralCalls(sourceFile, "redirect"),
      [geoOperationsAdminPath],
      `${routeFile} should redirect directly to the Command Center Geo Operations route`
    );
  }
});

test("admin Geo Operations page keeps login and role guards before rendering", async () => {
  const sourceFile = await parseSourceFile("app/admin/command-center/geo-operations/page.tsx");
  const redirectTargets = collectStringLiteralCalls(sourceFile, "redirect");

  assert.ok(redirectTargets.includes("/admin/login"));
  assert.ok(redirectTargets.includes("/admin/command-center"));
  assert.ok(
    callIncludesStringLiteral(sourceFile, "canAccessSection", geoOperationsSection),
    "admin page should authorize against the geo-operations section id"
  );
});
