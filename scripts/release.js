const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get new version from command line argument
const newVersion = process.argv[2];

if (!newVersion) {
    console.error('❌ Error: Please provide a version number. Usage: npm run release <version>');
    process.exit(1);
}

// Validation regex for semantic versioning (e.g., 2.3.6)
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(newVersion)) {
    console.error('❌ Error: Version must be in format X.Y.Z (e.g., 2.4.0)');
    process.exit(1);
}

console.log(`🚀 Preparing release for version: ${newVersion}...`);

const rootDir = path.resolve(__dirname, '..');

// 1. Update package.json
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = require(packageJsonPath);
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json');

// 2. Update Service Worker (sw.js)
const swPath = path.join(rootDir, 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');
// Replace: const CACHE_NAME = 'poketypes-vX.Y.Z';
swContent = swContent.replace(
    /const CACHE_NAME = 'poketypes-v\d+\.\d+\.\d+';/,
    `const CACHE_NAME = 'poketypes-v${newVersion}';`
);
fs.writeFileSync(swPath, swContent);
console.log('✅ Updated sw.js cache version');

// 3. Update index.html (Cache Busting)
const indexPath = path.join(rootDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
// Replace styles.css?v=...
indexContent = indexContent.replace(
    /href="styles\.css\?v=[\w\.-]+"/,
    `href="styles.css?v=${newVersion}"`
);
// Replace main.js?v=...
indexContent = indexContent.replace(
    /src="src\/js\/main\.js\?v=[\w\.-]+"/,
    `src="src/js/main.js?v=${newVersion}"`
);
fs.writeFileSync(indexPath, indexContent);
console.log('✅ Updated index.html asset versions');

// 4. Git Commands
try {
    console.log('📦 Committing changes...');
    execSync(`git add package.json sw.js index.html`);
    execSync(`git commit -m "chore: release v${newVersion}"`);
    
    console.log('🏷️  Tagging version...');
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
    
    console.log(`\n🎉 Release v${newVersion} ready!`);
    console.log(`👉 Run 'git push origin main --tags' to deploy.`);
} catch (error) {
    console.error('❌ Git operations failed:', error.message);
}
