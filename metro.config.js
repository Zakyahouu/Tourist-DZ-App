const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle .html files as assets (used for WebView map)
config.resolver.assetExts.push('html');

module.exports = config;
