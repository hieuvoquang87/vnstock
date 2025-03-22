// Documentation Verification Tool
// Usage: node doc-verification-tool.js

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

const IMPLEMENTATION_DIR = path.join(__dirname, '..', 'implementation');
const REQUIRED_SECTIONS = [
  '# ', // Title
  '## Overview', // Overview section
  '## Purpose', // Purpose section
  'TypeScript', // TypeScript implementation (flexible heading)
  'Example', // Usage examples (flexible heading)
  'Notes', // Implementation notes (flexible heading)
];

async function listAllMarkdownFiles(dir, filesList = [], relativePath = '') {
  const files = await readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = await stat(filePath);
    const relPath = path.join(relativePath, file);

    if (stats.isDirectory()) {
      await listAllMarkdownFiles(filePath, filesList, relPath);
    } else if (
      file.endsWith('.md') &&
      !file.includes('README.md') &&
      !file.includes('in-progress.md')
    ) {
      filesList.push({
        path: filePath,
        relativePath: relPath,
      });
    }
  }

  return filesList;
}

async function checkFileContents(file) {
  try {
    const contents = await readFile(file.path, 'utf8');
    const missingSection = [];

    // Check for required sections
    for (const section of REQUIRED_SECTIONS) {
      if (!contents.includes(section)) {
        missingSection.push(section);
      }
    }

    return {
      file: file.relativePath,
      size: contents.length,
      lines: contents.split('\n').length,
      complete: missingSection.length === 0,
      missingSections: missingSection,
    };
  } catch (error) {
    return {
      file: file.relativePath,
      error: error.message,
      complete: false,
    };
  }
}

async function countCrossSectionLinks(file) {
  try {
    const contents = await readFile(file.path, 'utf8');
    const matches = contents.match(/\[.*?\]\(.*?\.md\)/g) || [];
    return matches.length;
  } catch (error) {
    return 0;
  }
}

async function main() {
  try {
    console.log('Starting documentation verification...');
    const files = await listAllMarkdownFiles(IMPLEMENTATION_DIR);
    console.log(`Found ${files.length} markdown files for verification.`);

    // Stats collectors
    let completeFiles = 0;
    let incompleteFiles = 0;
    let totalLinks = 0;
    const incompleteSummary = [];

    // Section stats
    const sectionStats = {};
    REQUIRED_SECTIONS.forEach((section) => {
      sectionStats[section] = 0;
    });

    // Process files
    console.log('\nProcessing files:');
    for (const file of files) {
      const result = await checkFileContents(file);
      const linkCount = await countCrossSectionLinks(file);
      totalLinks += linkCount;

      if (result.complete) {
        completeFiles++;
        process.stdout.write('.');
      } else {
        incompleteFiles++;
        process.stdout.write('X');
        incompleteSummary.push({
          file: result.file,
          missingSections: result.missingSections,
        });

        // Update section stats
        result.missingSections.forEach((section) => {
          sectionStats[section]++;
        });
      }
    }

    // Generate report
    console.log('\n\n==========================================');
    console.log('Documentation Verification Report');
    console.log('==========================================');
    console.log(`\nTotal files: ${files.length}`);
    console.log(
      `Complete files: ${completeFiles} (${Math.round(
        (completeFiles / files.length) * 100
      )}%)`
    );
    console.log(
      `Incomplete files: ${incompleteFiles} (${Math.round(
        (incompleteFiles / files.length) * 100
      )}%)`
    );
    console.log(`Total cross-section links: ${totalLinks}`);

    if (incompleteFiles > 0) {
      console.log('\nIncomplete files:');
      incompleteSummary.forEach((item, index) => {
        console.log(`${index + 1}. ${item.file}`);
        console.log(`   Missing: ${item.missingSections.join(', ')}`);
      });
    }

    console.log('\nMissing sections summary:');
    for (const [section, count] of Object.entries(sectionStats)) {
      if (count > 0) {
        console.log(
          `${section}: missing in ${count} files (${Math.round(
            (count / files.length) * 100
          )}%)`
        );
      }
    }

    console.log('\n==========================================');
    console.log('Verification complete.');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

main();
