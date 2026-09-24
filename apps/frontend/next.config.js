const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const key = match[1];
    if (process.env[key] !== undefined) continue;
    process.env[key] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jurix/shared-types'],
};

module.exports = nextConfig;

