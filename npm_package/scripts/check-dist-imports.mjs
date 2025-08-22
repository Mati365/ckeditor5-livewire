import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const IMPORT_PATTERNS = [
  /import\s[^'";]+['"]ckeditor5['"]/,
  /import\s[^'";]+['"]ckeditor5-premium-features['"]/,
  /require\(['"]ckeditor5['"]\)/,
  /require\(['"]ckeditor5-premium-features['"]\)/,
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  for (const pattern of IMPORT_PATTERNS) {
    if (pattern.test(content)) {
      return true;
    }
  }

  return false;
}

function scanDir(dir) {
  let found = false;

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (scanDir(fullPath)) {
        found = true;
      }
    }
    else if (stat.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.mjs'))) {
      if (scanFile(fullPath)) {
        console.error(`❌ Forbidden import found in: ${fullPath}`);
        found = true;
      }
    }
  }

  return found;
}

if (!fs.existsSync('dist/')) {
  console.warn('No dist directory found, skipping import check.');
  process.exit(0);
}

const hasForbiddenImports = scanDir('dist/');

if (hasForbiddenImports) {
  console.error('\n❌ Value imports from ckeditor5 or ckeditor5-premium-features are forbidden in dist/.');
  process.exit(1);
}

console.warn('No forbidden imports found in dist/.');
