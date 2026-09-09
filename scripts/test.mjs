import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Use the existing TypeScript compiler and Node test runner; no test dependencies.
const output = mkdtempSync(join(tmpdir(), "shopstack-tests-"));
try {
  execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tests/tsconfig.json", "--outDir", output], { stdio: "inherit" });
  execFileSync(process.execPath, ["--test", join(output, "tests/api.test.js"), join(output, "tests/utils.test.js")], { stdio: "inherit" });
} finally {
  rmSync(output, { recursive: true, force: true });
}
