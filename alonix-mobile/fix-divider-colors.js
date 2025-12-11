const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');

const filesToFix = [
  'AchievementsScreen.js',
  'BookingConfirmationScreen.js',
  'ClubDetailScreen.js',
  'DriverTrackingScreen.js',
  'LeaderboardScreen.js',
  'LoginScreen.js',
  'PaymentScreen.js',
  'RegisterScreen.js',
  'ReviewsScreen.js',
  'UberStyleRideScreen.js',
  'UserProfileScreen.js'
];

// Replace backgroundColor: COLORS.border with a neutral color
const pattern = {
  find: /backgroundColor:\s*COLORS\.border,?/g,
  replace: `backgroundColor: 'rgba(200, 200, 200, 0.2)', // Neutral divider`
};

const pattern2 = {
  find: /borderRightColor:\s*COLORS\.border,?/g,
  replace: `borderRightColor: 'rgba(200, 200, 200, 0.3)', // Neutral divider`
};

let totalReplacements = 0;
let filesModified = 0;

filesToFix.forEach(fileName => {
  const filePath = path.join(screensDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileName}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileReplacements = 0;

  // Apply replacements
  let matches1 = content.match(pattern.find);
  if (matches1) {
    content = content.replace(pattern.find, pattern.replace);
    fileReplacements += matches1.length;
  }

  let matches2 = content.match(pattern2.find);
  if (matches2) {
    content = content.replace(pattern2.find, pattern2.replace);
    fileReplacements += matches2.length;
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplacements += fileReplacements;
    console.log(`✅ Fixed ${fileName} - ${fileReplacements} divider(s)`);
  }
});

console.log(`\n${'='.repeat(50)}`);
console.log(`Files modified: ${filesModified}/${filesToFix.length}`);
console.log(`Total dividers fixed: ${totalReplacements}`);
console.log(`${'='.repeat(50)}`);
console.log(`\n✨ All divider colors updated to neutral tones!`);
