const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  rootDir: path.join(__dirname, 'src'),
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
  dryRun: false, // Set to true to see what changes would be made without writing
  verbose: true, // Set to false to reduce console output
};

/**
 * Recursively finds all files in a directory matching the specified extensions
 * @param {string} dir - Directory to search
 * @param {string[]} extensions - File extensions to include
 * @returns {string[]} Array of file paths
 */
function findFiles(dir, extensions) {
  try {
    if (!fs.existsSync(dir)) {
      console.error(`Directory not found: ${dir}`);
      return [];
    }

    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        // Skip node_modules and other common directories
        if (['node_modules', '.next', '.git', 'dist', 'build'].includes(item.name)) {
          continue;
        }
        files.push(...findFiles(fullPath, extensions));
      } else if (extensions.some(ext => item.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }

    return files;
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    return [];
  }
}

/**
 * Removes version numbers from import statements in a file
 * @param {string} filePath - Path to the file to process
 * @returns {boolean} Whether changes were made
 */
function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove version numbers from regular imports (e.g., from "package@1.2.3")
    content = content.replace(
      /from\s+["']([^"'@]+)@[\d.]+["']/g,
      'from "$1"'
    );
    
    // Remove version numbers from scoped imports (e.g., from "@scope/package@1.2.3")
    content = content.replace(
      /from\s+["'](@[^/]+\/[^/"'@]+)@[\d.]+["']/g,
      'from "$1"'
    );
    
    // Also handle require() statements
    content = content.replace(
      /require\(\s*["']([^"'@]+)@[\d.]+["']\s*\)/g,
      'require("$1")'
    );
    
    content = content.replace(
      /require\(\s*["'](@[^/]+\/[^/"'@]+)@[\d.]+["']\s*\)/g,
      'require("$1")'
    );
    
    if (content !== originalContent) {
      if (!CONFIG.dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      if (CONFIG.verbose) {
        console.log(`✅ Fixed imports in ${path.relative(process.cwd(), filePath)}`);
      }
      return true;
    }
    
    if (CONFIG.verbose) {
      console.log(`ℹ️  No changes needed for ${path.relative(process.cwd(), filePath)}`);
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function to process all files
 */
function main() {
  console.log('🔍 Searching for files to process...');
  const files = findFiles(CONFIG.rootDir, CONFIG.fileExtensions);
  
  if (files.length === 0) {
    console.log('No files found to process.');
    return;
  }
  
  console.log(`📂 Found ${files.length} files to process`);
  
  if (CONFIG.dryRun) {
    console.log('🚧 DRY RUN: No files will be modified');
  }
  
  let filesModified = 0;
  let filesSkipped = 0;
  let filesWithErrors = 0;
  
  for (const file of files) {
    try {
      const result = fixImports(file);
      if (result === true) filesModified++;
      else filesSkipped++;
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      filesWithErrors++;
    }
  }
  
  console.log('\n📊 Results:');
  console.log(`✅ ${filesModified} files modified`);
  console.log(`ℹ️  ${filesSkipped} files already correct`);
  console.log(`❌ ${filesWithErrors} files had errors`);
  
  if (CONFIG.dryRun) {
    console.log('\n💡 This was a dry run. No files were actually modified.');
    console.log('   To apply changes, set dryRun: false in the CONFIG object.');
  }
}

// Run the script
main();
