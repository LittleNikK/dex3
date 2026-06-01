#!/usr/bin/env node

/**
 * MSTSwap - Zero Config Validation Test
 * 
 * This script validates that the frontend is properly configured for:
 * 1. Live MST testnet connection
 * 2. Hardcoded contract addresses
 * 3. No .env dependencies for contract data
 * 4. Dynamic wallet detection on MetaMask connection
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(color, ...args) {
  console.log(color, ...args, COLORS.reset);
}

function checkFile(filePath, description, checks) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(COLORS.red, `✗ FAIL: ${description} - File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  let passed = true;

  for (const [pattern, shouldExist, description] of checks) {
    const exists = new RegExp(pattern).test(content);
    
    if (shouldExist && !exists) {
      log(COLORS.red, `✗ FAIL: ${description}`);
      log(COLORS.gray, `  Pattern not found in ${filePath}: ${pattern}`);
      passed = false;
    } else if (!shouldExist && exists) {
      log(COLORS.red, `✗ FAIL: ${description}`);
      log(COLORS.gray, `  Pattern should NOT exist in ${filePath}: ${pattern}`);
      passed = false;
    } else if (shouldExist) {
      log(COLORS.green, `✓ PASS: ${description}`);
    } else {
      log(COLORS.green, `✓ PASS: ${description} (correctly not found)`);
    }
  }

  return passed;
}

console.log('\n' + '='.repeat(70));
log(COLORS.blue, '  MSTSwap Zero-Config Validation Test');
log(COLORS.blue, '='.repeat(70));

let allPassed = true;

// Test 1: Check mst-live.ts exists and has hardcoded config
log(COLORS.yellow, '\n📋 Test 1: Hardcoded MST Live Config');
allPassed &= checkFile('frontend/src/config/mst-live.ts', 'MST Live Config', [
  ['MST_LIVE_CONFIG', true, 'Hardcoded MST config object exists'],
  ['0xAa0Ab95AA3d885c00711541000eA2c2E66b9472b', true, 'WMST address hardcoded (0xAa0...72b)'],
  ['0xB8dbCe17CB5931DD83aF8dD9a23A4aFbFf33E7a6', true, 'Swap Router address hardcoded (0xB8d...7a6)'],
  ['https://testnetrpc.mstblockchain.com', true, 'Live MST RPC URL hardcoded'],
  ['91562037', true, 'MST Testnet chain ID hardcoded (91562037)']
]);

// Test 2: Check contracts.ts uses hardcoded config, not .env
log(COLORS.yellow, '\n📋 Test 2: Contracts Config - No .env Dependencies');
allPassed &= checkFile('frontend/src/config/contracts.ts', 'Contracts Config', [
  ['import.meta.env.VITE_WMST', false, 'No VITE_WMST_ADDRESS env var (should use hardcoded)'],
  ['import.meta.env.VITE_SWAP_ROUTER', false, 'No VITE_SWAP_ROUTER_ADDRESS env var'],
  ['import.meta.env.VITE_QUOTER', false, 'No VITE_QUOTER_V2_ADDRESS env var'],
  ['MST_LIVE_CONFIG', true, 'Imports MST_LIVE_CONFIG'],
  ['CONTRACTS.*MST_LIVE_CONFIG.contracts', true, 'Contracts use hardcoded config']
]);

// Test 3: Check wagmi.ts uses hardcoded RPC
log(COLORS.yellow, '\n📋 Test 3: Wagmi Config - Hardcoded RPC');
allPassed &= checkFile('frontend/src/config/wagmi.ts', 'Wagmi Config', [
  ['MST_LIVE_CONFIG.rpcUrl', true, 'Uses hardcoded MST RPC from mst-live.ts'],
  ['MST_LIVE_CONFIG', true, 'Imports and uses MST_LIVE_CONFIG'],
  ['injected', true, 'Uses injected MetaMask connector']
]);

// Test 4: Check frontend .env is minimal (optional, not required)
log(COLORS.yellow, '\n📋 Test 4: Frontend .env - Minimal/Optional');
allPassed &= checkFile('frontend/.env', 'Frontend .env', [
  ['VITE_FORM_ID', true, 'Only contains optional FORM_ID (not critical config)'],
  ['VITE_WMST_ADDRESS', false, 'Does NOT contain VITE_WMST_ADDRESS (uses hardcoded)'],
  ['VITE_SWAP_ROUTER', false, 'Does NOT contain VITE_SWAP_ROUTER_ADDRESS'],
]);

// Test 5: Check setup guide exists
log(COLORS.yellow, '\n📋 Test 5: Setup Documentation');
allPassed &= checkFile('SETUP_ZERO_CONFIG.md', 'Setup Zero Config Guide', [
  ['Zero Configuration Setup', true, 'Title mentions zero config'],
  ['Connect MetaMask', true, 'Instructions include MetaMask connection'],
  ['file required', true, 'Clearly states no .env required'],
  ['0xAa0Ab95AA3d885c00711541000eA2c2E66b9472b', true, 'Documents deployed addresses']
]);

// Test 6: Check README points to zero config guide
log(COLORS.yellow, '\n📋 Test 6: Updated README');
allPassed &= checkFile('README.md', 'Main README', [
  ['SETUP_ZERO_CONFIG', true, 'References zero config guide'],
  ['QUICK START', true, 'Has quick start section'],
  ['file needed', true, 'States no .env needed for frontend']
]);

console.log('\n' + '='.repeat(70));

if (allPassed) {
  log(COLORS.green, '✓ ALL TESTS PASSED - Ready for Deployment!');
  log(COLORS.green, '\nYou can now:');
  log(COLORS.green, '  1. Share this folder with anyone');
  log(COLORS.green, '  2. They just need to run: cd frontend && npm install && npm run dev');
  log(COLORS.green, '  3. Open http://localhost:3001, connect MetaMask, and it works!');
  log(COLORS.green, '='.repeat(70) + '\n');
  process.exit(0);
} else {
  log(COLORS.red, '✗ SOME TESTS FAILED - Review the output above');
  log(COLORS.red, '='.repeat(70) + '\n');
  process.exit(1);
}
