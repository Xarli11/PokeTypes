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
swContent = swContent.replace(
    /const CACHE_NAME = 'poketypes-v\d+\.\d+\.\d+';/,
    `const CACHE_NAME = 'poketypes-v${newVersion}';`
);
fs.writeFileSync(swPath, swContent);
console.log('✅ Updated sw.js cache version');

// 3. Update index.html (Cache Busting)
const indexPath = path.join(rootDir, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent.replace(
    /href="styles\.css\?v=[\w\.-]+"/,
    `href="styles.css?v=${newVersion}"`
);
indexContent = indexContent.replace(
    /src="src\/js\/main\.js\?v=[\w\.-]+"/,
    `src="src/js/main.js?v=${newVersion}"`
);
fs.writeFileSync(indexPath, indexContent);
console.log('✅ Updated index.html asset versions');

// 3.1 Helper function to recursively get all JS files in src/js
function getAllJsFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllJsFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.js')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

// 3.2 Update ALL JS internal imports (Module Cache Busting)
const srcJsPath = path.join(rootDir, 'src', 'js');
const allJsFiles = getAllJsFiles(srcJsPath);
const filesToCommit = ['package.json', 'sw.js', 'index.html'];

console.log(`🔍 Scanning ${allJsFiles.length} JS files for imports...`);

allJsFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Regex explanation:
    // from '   -> match start of import path
    // ([^']+  -> match the file path (group 1)
    // \.js     -> match .js extension
    // (?: \?v=[\w\.-]+ )? -> optionally match existing version param (non-capturing)
    // '
    // Matches: from './modules/ui.js' AND from './modules/ui.js?v=1.0.0'
    const importRegex = /from '([^']+)\.js(?:\?v=[\w\.-]+)?'/g;

    if (importRegex.test(content)) {
        content = content.replace(importRegex, `from '$1.js?v=${newVersion}'`);
        fs.writeFileSync(filePath, content);
        updated = true;
    }

    if (updated) {
        // Add relative path for git
        const relativePath = path.relative(rootDir, filePath);
        filesToCommit.push(relativePath);
        console.log(`   Updated imports in: ${path.basename(filePath)}`);
    }
});
console.log('✅ Updated internal module versions globally');

// 4. Git Commands
try {
    console.log('📦 Committing changes...');
    // Join file paths with spaces
    const filesString = filesToCommit.join(' ');
    execSync(`git add ${filesString}`);
    execSync(`git commit -m "chore: release v${newVersion}"`);
    
    console.log('🏷️  Tagging version...');
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
    
    console.log(`\n🎉 Release v${newVersion} ready!`);
    console.log(`👉 Run 'git push origin main --tags' to deploy.`);
} catch (error) {
    console.error('❌ Git operations failed:', error.message);
}