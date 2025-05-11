const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Lägg till polyfills för Node.js moduler som saknas i React Native
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve("readable-stream"),
  http: require.resolve("stream-http"),
  https: require.resolve("stream-http"),
  net: require.resolve("stream-http"),
  crypto: require.resolve("react-native-crypto"),
  url: require.resolve("url"),
  tls: require.resolve("react-native-crypto"),
  zlib: require.resolve("browserify-zlib"),
  util: require.resolve("util"),
  assert: require.resolve("assert"),
};

module.exports = config;
