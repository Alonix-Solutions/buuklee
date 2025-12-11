const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');

// Get all screen files
const allScreenFiles = fs.readdirSync(screensDir).filter(f => f.endsWith('Screen.js'));

console.log(`\n🔍 Scanning ${allScreenFiles.length} screen files for liquid glass improvements...\n`);

const patterns = [
  {
    name: 'Bottom border with COLORS.border',
    find: /(\s+)borderBottomWidth:\s*1,?\s*\n\s+borderBottomColor:\s*COLORS\.border,?/g,
    replace: `$1borderBottomWidth: 1,\n$1borderBottomColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider`
  },
  {
    name: 'Top border with COLORS.border',
    find: /(\s+)borderTopWidth:\s*1,?\s*\n\s+borderTopColor:\s*COLORS\.border,?/g,
    replace: `$1borderTopWidth: 1,\n$1borderTopColor: 'rgba(255, 255, 255, 0.4)', // Subtle liquid glass divider`
  },
  {
    name: 'Stand-alone borderBottomColor',
    find: /(\s+)borderBottomColor:\s*COLORS\.border,?/g,
    replace: `$1borderBottomColor: 'rgba(255, 255, 255, 0.4)',`
  },
  {
    name: 'Stand-alone borderTopColor',
    find: /(\s+)borderTopColor:\s*COLORS\.border,?/g,
    replace: `$1borderTopColor: 'rgba(255, 255, 255, 0.4)',`
  },
  {
    name: 'COLORS.border with borderWidth: 2',
    find: /(\s+)borderWidth:\s*2,?\s*\n\s+borderColor:\s*COLORS\.border,?/g,
    replace: `$1borderWidth: 2,\n$1borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass`
  }
];

let totalReplacements = 0;
let filesModified = 0;

allScreenFiles.forEach(fileName => {
  const filePath = path.join(screensDir, fileName);

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileReplacements = 0;
  let filePatterns = [];

  // Apply all pattern replacements
  patterns.forEach((pattern) => {
    const matches = content.match(pattern.find);
    if (matches) {
      content = content.replace(pattern.find, pattern.replace);
      fileReplacements += matches.length;
      filePatterns.push(`${pattern.name} (${matches.length})`);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplacements += fileReplacements;
    console.log(`✅ ${fileName}`);
    filePatterns.forEach(p => console.log(`   - ${p}`));
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 Summary:`);
console.log(`   Files modified: ${filesModified}/${allScreenFiles.length}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log(`${'='.repeat(60)}`);

if (filesModified > 0) {
  console.log(`\n✨ Liquid glass improvements applied successfully!`);
} else {
  console.log(`\n✅ All screens already have proper liquid glass!`);
}
