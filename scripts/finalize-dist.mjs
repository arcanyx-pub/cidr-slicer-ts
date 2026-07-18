// After the ESM and CJS builds, drop a package.json into each output directory
// declaring its module type. The root package.json is `"type": "module"`, so
// without these markers Node would interpret dist/cjs/*.js as ESM and fail.
import { writeFileSync } from "node:fs";

writeFileSync("dist/esm/package.json", `${JSON.stringify({ type: "module" }, null, 2)}\n`);
writeFileSync("dist/cjs/package.json", `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`);

console.log("wrote dist/esm/package.json (module) and dist/cjs/package.json (commonjs)");
