import { mkdtempSync, writeFileSync, chmodSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const tmp = mkdtempSync(join(tmpdir(), 'ohouse-git-count-'));
const countFile = join(tmp, 'git-log-count');
const gitWrapper = join(tmp, 'git');
const realGit = process.env.REAL_GIT || '/Users/kylie.kim/bin/git';

writeFileSync(countFile, '0');
writeFileSync(
  gitWrapper,
  `#!/bin/sh
if [ "$1" = "log" ]; then
  count=$(cat "${countFile}")
  count=$((count + 1))
  printf "%s" "$count" > "${countFile}"
fi
exec "${realGit}" "$@"
`,
);
chmodSync(gitWrapper, 0o755);

process.env.PATH = `${tmp}:${process.env.PATH}`;

try {
  const { getAllDomains } = await import('../src/lib/repo.js');

  getAllDomains();
  const firstCount = Number(readFileSync(countFile, 'utf8'));

  getAllDomains();
  const secondCount = Number(readFileSync(countFile, 'utf8'));

  if (firstCount === 0) {
    throw new Error('Expected getAllDomains() to read git metadata at least once.');
  }

  if (secondCount !== firstCount) {
    throw new Error(`Expected cached git metadata on repeated getAllDomains(); git log count changed from ${firstCount} to ${secondCount}.`);
  }

  console.log(`Repo metadata cache validation passed: ${firstCount} git log call(s), no repeat calls.`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
