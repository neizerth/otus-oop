const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { join } = require("node:path");

const files = readdirSync(__dirname)
  .filter((name) => /^\d+.+\.js$/.test(name))
  .sort();

let failed = 0;

for (const file of files) {
  const result = spawnSync(process.execPath, [join(__dirname, file)], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    failed += 1;
    console.error(`\nFAILED ${file}\n`);
  }
}

if (failed > 0) {
  console.error(`${failed} example(s) failed`);
  process.exit(1);
}

console.log(`\n${files.length} examples passed`);
