const fs = require('fs');
const path = require('path');

// Directories to search in
const directories = [
  path.join(__dirname, 'src/pages'),
  path.join(__dirname, 'src/components')
];

// Function to replace axios imports and usages in a file
function processFile(filePath) {
  // Skip non-JavaScript files
  if (!filePath.endsWith('.js')) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace axios import with our api utility
    content = content.replace(
      /import axios from ['"]axios['"];/g,
      `import api from '../utils/api';`
    );
    
    // Replace all axios usages with api
    content = content.replace(/axios\./g, 'api.');
    
    // Only write if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Function to recursively process all files in a directory
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else {
      processFile(filePath);
    }
  });
}

// Process all directories
directories.forEach(dir => {
  processDirectory(dir);
});

console.log('All done!');
