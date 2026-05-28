/**
 * Cross-platform build script for Windows/Linux/macOS
 * Replaces Unix-specific `cp` commands with Node.js fs operations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEXT_DIR = path.join(ROOT_DIR, '.next');
const STANDALONE_DIR = path.join(NEXT_DIR, 'standalone');
const STANDALONE_NEXT_DIR = path.join(STANDALONE_DIR, '.next');

console.log('=== HR Management System - Build Script ===\n');

// Step 1: Generate Prisma Client
console.log('[1/5] Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: ROOT_DIR });
  console.log('  ✓ Prisma Client generated\n');
} catch (err) {
  console.error('  ✗ Failed to generate Prisma Client');
  process.exit(1);
}

// Step 2: Build Next.js
console.log('[2/5] Building Next.js...');
try {
  execSync('npx next build', { stdio: 'inherit', cwd: ROOT_DIR });
  console.log('  ✓ Next.js build complete\n');
} catch (err) {
  console.error('  ✗ Next.js build failed');
  process.exit(1);
}

// Helper: Copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  ⚠ Source directory not found: ${src}`);
    return;
  }

  // Create dest directory
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Step 3: Copy .next/static to .next/standalone/.next/static
console.log('[3/5] Copying static files to standalone...');
const staticSrc = path.join(NEXT_DIR, 'static');
const staticDest = path.join(STANDALONE_NEXT_DIR, 'static');
try {
  copyDirSync(staticSrc, staticDest);
  console.log('  ✓ Static files copied\n');
} catch (err) {
  console.error('  ✗ Failed to copy static files:', err.message);
  process.exit(1);
}

// Step 4: Copy public directory
console.log('[4/5] Copying public directory...');
const publicSrc = path.join(ROOT_DIR, 'public');
const publicDest = path.join(STANDALONE_DIR, 'public');
try {
  copyDirSync(publicSrc, publicDest);
  console.log('  ✓ Public directory copied\n');
} catch (err) {
  console.error('  ✗ Failed to copy public directory:', err.message);
  process.exit(1);
}

// Step 5: Copy prisma directory and .env
console.log('[5/5] Copying prisma directory and .env...');
const prismaSrc = path.join(ROOT_DIR, 'prisma');
const prismaDest = path.join(STANDALONE_DIR, 'prisma');
try {
  copyDirSync(prismaSrc, prismaDest);
  console.log('  ✓ Prisma directory copied');
} catch (err) {
  console.error('  ✗ Failed to copy prisma directory:', err.message);
}

const envSrc = path.join(ROOT_DIR, '.env');
const envDest = path.join(STANDALONE_DIR, '.env');
try {
  if (fs.existsSync(envSrc)) {
    fs.copyFileSync(envSrc, envDest);
    console.log('  ✓ .env file copied');
  } else {
    console.warn('  ⚠ .env file not found, skipping');
  }
} catch (err) {
  console.error('  ✗ Failed to copy .env file:', err.message);
}

// Copy the Prisma engine binaries if they exist in node_modules
const prismaEnginesSrc = path.join(ROOT_DIR, 'node_modules', '.prisma');
const prismaEnginesDest = path.join(STANDALONE_DIR, 'node_modules', '.prisma');
if (fs.existsSync(prismaEnginesSrc)) {
  try {
    copyDirSync(prismaEnginesSrc, prismaEnginesDest);
    console.log('  ✓ Prisma engines copied');
  } catch (err) {
    console.warn('  ⚠ Could not copy Prisma engines:', err.message);
  }
}

console.log('\n=== Build Complete! ===');
console.log(`To start the server, run:`);
console.log(`  cd .next/standalone`);
console.log(`  node server.js`);
console.log(`\nOr from project root:`);
console.log(`  node .next/standalone/server.js`);
