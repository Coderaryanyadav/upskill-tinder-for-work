import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  rootDir: path.join(__dirname, 'src'),
  fileExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  dryRun: false,
  verbose: true,
};

// Find all files with the specified extensions
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

// Update motion imports in a file
function updateMotionImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace motion/react imports with framer-motion
    content = content.replace(
      /from\s+['"]motion\/react['"]/g,
      'from "framer-motion"'
    );

    if (content !== originalContent) {
      if (CONFIG.verbose) {
        console.log(`Updating imports in: ${filePath}`);
      }
      
      if (!CONFIG.dryRun) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    console.log('Starting to update motion imports...');
    
    const files = findFiles(CONFIG.rootDir, CONFIG.fileExtensions);
    console.log(`Found ${files.length} files to process`);
    
    let updatedCount = 0;
    
    for (const file of files) {
      if (updateMotionImports(file)) {
        updatedCount++;
      }
    }
    
    console.log(`\nUpdate complete!`);
    console.log(`Files processed: ${files.length}`);
    console.log(`Files updated: ${updatedCount}`);
    
    if (CONFIG.dryRun) {
      console.log('\nDry run complete. No files were actually modified.');
      console.log('Set dryRun: false in the CONFIG object to apply changes.');
    }
    
    return { success: true, filesProcessed: files.length, filesUpdated: updatedCount };
  } catch (error) {
    console.error('Error in main function:', error);
    throw error;
  }
}

// Run the script
main().then(() => {
  console.log('Import updates completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('Error running script:', error);
  process.exit(1);
});
