
import fs from 'fs';

const artifacts = {};
const files = fs.readdirSync('build/contracts');

for (const file of files) {
  if (!file.endsWith('.json')) {
    continue;
  }

  const blob = JSON.parse(fs.readFileSync(`build/contracts/${file}`));
  artifacts[blob.contractName] = blob;
}

export default artifacts;
