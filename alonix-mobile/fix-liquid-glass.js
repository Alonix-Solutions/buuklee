const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');

const filesToFix = [
  'ActivityTrackerScreen.js',
  'CarBookingScreen.js',
  'CarDetailScreen.js',
  'CarRentalScreen.js',
  'ChallengeDetailScreen.js',
  'CreateChallengeScreen.js',
  'DriverSelectionScreen.js',
  'EditProfileScreen.js',
  'GamificationScreen.js',
  'HelpScreen.js',
  'LeaderboardScreen.js',
  'MyBookingsScreen.js',
  'PaymentScreen.js',
  'RideRequestScreen.js',
  'SettingsScreen.js',
  'UberStyleRideScreen.js',
  'UserProfileScreen.js',
  'WriteReviewScreen.js'
];

// Pattern to find and replace
const patterns = [
  {
    // Pattern 1: borderWidth: 1, borderColor: COLORS.border -> liquid glass
    find: /(\s+)borderWidth:\s*1,?\s*\n\s+borderColor:\s*COLORS\.border,?/g,
    replace: `$1borderWidth: 1.5,\n$1borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass\n$1shadowColor: COLORS.darkGray,\n$1shadowOpacity: 0.1,\n$1shadowOffset: { width: 0, height: 2 },\n$1shadowRadius: 4,\n$1elevation: 2,`
  },
  {
    // Pattern 2: just borderColor: COLORS.border (without borderWidth nearby)
    find: /(\s+)borderColor:\s*COLORS\.border,?/g,
    replace: `$1borderWidth: 1.5,\n$1borderColor: 'rgba(255, 255, 255, 0.6)', // Liquid glass`
  }
];

let totalReplacements = 0;
let filesModified = 0;

filesToFix.forEach(fileName => {
  const filePath = path.join(screensDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${fileName}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileReplacements = 0;

  // Apply all pattern replacements
  patterns.forEach((pattern, index) => {
    const matches = content.match(pattern.find);
    if (matches) {
      content = content.replace(pattern.find, pattern.replace);
      fileReplacements += matches.length;
      console.log(`  Pattern ${index + 1}: ${matches.length} replacements`);
    }
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesModified++;
    totalReplacements += fileReplacements;
    console.log(`✅ Fixed ${fileName} - ${fileReplacements} replacements`);
  } else {
    console.log(`⚪ No changes needed in ${fileName}`);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Files modified: ${filesModified}/${filesToFix.length}`);
console.log(`Total replacements: ${totalReplacements}`);
console.log(`✨ Liquid glass pattern applied successfully!`);
