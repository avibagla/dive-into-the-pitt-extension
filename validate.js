#!/usr/bin/env node

// Simple validation script for Dive into The Pitt Chrome Extension
// Run with: node validate.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Dive into The Pitt Chrome Extension...\n');

const requiredFiles = [
    'manifest.json',
    'content.js',
    'styles.css',
    'popup.html',
    'popup.js'
];

const optionalFiles = [
    'icon16.png',
    'icon48.png',
    'icon128.png',
    'README.md',
    'install.md'
];

let allValid = true;

// Check required files
console.log('📄 Checking required files:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING!`);
        allValid = false;
    }
});

// Check optional files
console.log('\n📄 Checking optional files:');
optionalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ⚠️  ${file} - Missing (optional)`);
    }
});

// Validate manifest.json
if (fs.existsSync('manifest.json')) {
    console.log('\n🔧 Validating manifest.json:');
    try {
        const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
        
        if (manifest.manifest_version === 3) {
            console.log('  ✅ Manifest version 3');
        } else {
            console.log('  ❌ Invalid manifest version');
            allValid = false;
        }
        
        if (manifest.name && manifest.name.includes('Pitt')) {
            console.log('  ✅ Extension name');
        } else {
            console.log('  ❌ Missing or invalid name');
            allValid = false;
        }
        
        if (manifest.permissions && Array.isArray(manifest.permissions)) {
            console.log('  ✅ Permissions array');
        } else {
            console.log('  ❌ Missing permissions');
            allValid = false;
        }
        
        if (manifest.content_scripts && Array.isArray(manifest.content_scripts)) {
            console.log('  ✅ Content scripts');
        } else {
            console.log('  ❌ Missing content scripts');
            allValid = false;
        }
        
    } catch (error) {
        console.log('  ❌ Invalid JSON format');
        allValid = false;
    }
}

// Check JavaScript files for basic syntax
console.log('\n📝 Checking JavaScript syntax:');
['content.js', 'popup.js'].forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Basic checks
        if (content.includes('PittRealTime') || content.includes('episode')) {
            console.log(`  ✅ ${file} - Contains expected content`);
        } else {
            console.log(`  ⚠️  ${file} - May be missing expected content`);
        }
        
        // Check for common syntax issues
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        
        if (openBraces === closeBraces) {
            console.log(`  ✅ ${file} - Balanced braces`);
        } else {
            console.log(`  ❌ ${file} - Unbalanced braces (${openBraces} open, ${closeBraces} close)`);
            allValid = false;
        }
    }
});

// Episode ID check
console.log('\n🎬 Checking episode configuration:');
if (fs.existsSync('content.js')) {
    const content = fs.readFileSync('content.js', 'utf8');
    const episodeMatches = content.match(/episodeId:\s*"([^"]+)"/g) || [];
    const validIds = episodeMatches.filter(match => !match.includes('""')).length;
    
    console.log(`  📺 Found ${validIds} episodes with IDs configured`);
    if (validIds === 0) {
        console.log(`  ⚠️  No episode IDs configured yet - extension will have limited functionality`);
    }
    
    if (content.includes('0bb030e8-163a-4012-ae1a-89d9d2c5755e')) {
        console.log(`  ✅ Episode 2 ID found`);
    } else {
        console.log(`  ⚠️  Episode 2 ID missing`);
    }
}

// Final result
console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('🎉 Extension validation PASSED!');
    console.log('\nNext steps:');
    console.log('1. Generate icons using create_icons.html');
    console.log('2. Load extension in Chrome (chrome://extensions/)');
    console.log('3. Test on Max video pages');
} else {
    console.log('❌ Extension validation FAILED!');
    console.log('\nPlease fix the issues above before installing.');
}

console.log('\n📖 See install.md for detailed setup instructions.');
console.log('🆘 Report issues at: https://github.com/your-repo/issues');

module.exports = { allValid };