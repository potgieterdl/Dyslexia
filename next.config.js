/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {},
  },
  serverExternalPackages: ['better-sqlite3'],
};

module.exports = nextConfig;
