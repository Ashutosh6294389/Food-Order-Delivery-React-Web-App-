const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'cjs' extension if it's not already included
config.resolver.sourceExts.push('cjs');

// Optionally disable package exports resolution if needed
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
