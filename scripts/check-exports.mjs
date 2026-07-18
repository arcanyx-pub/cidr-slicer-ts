// Guards against the "manifest points at a file that isn't shipped/built" class of
// bug (the one a user hit deep-importing a subpath that had no exports entry).
// Every target referenced by "exports", "main", "module", or "types" must:
//   1. exist on disk, so a consumer can actually resolve it, and
//   2. be covered by "files", so it lands in the published tarball.
// Run after `npm run build`.
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));

// Collect every string leaf in the (possibly nested) exports conditions map.
function collectExportTargets(node, acc = []) {
    if (typeof node === "string") {
        acc.push(node);
    } else if (node && typeof node === "object") {
        for (const value of Object.values(node)) collectExportTargets(value, acc);
    }
    return acc;
}

const targets = [
    ...new Set(
        [...collectExportTargets(pkg.exports), pkg.main, pkg.module, pkg.types].filter(Boolean),
    ),
];
if (targets.length === 0) {
    throw new Error("package.json declares no exports/main/module/types targets");
}

const files = pkg.files ?? [];
const isPackaged = target => {
    const base = target.replace(/^\.\//, "");
    // npm always ships package.json regardless of "files".
    if (base === "package.json") return true;
    return files.some(f => {
        const entry = f.replace(/^\.\//, "").replace(/\/$/, "");
        return base === entry || base.startsWith(`${entry}/`);
    });
};

const errors = [];
for (const target of targets) {
    if (!existsSync(target)) {
        errors.push(`"${target}" does not exist on disk (did the build run?)`);
    } else if (!isPackaged(target)) {
        errors.push(`"${target}" is not covered by "files": ${JSON.stringify(files)}`);
    }
}

if (errors.length > 0) {
    throw new Error(`check-exports failed:\n  - ${errors.join("\n  - ")}`);
}

console.log(`check-exports: all ${targets.length} manifest targets exist and are packaged`);
