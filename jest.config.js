module.exports = {
  preset: '@react-native/jest-preset',
  transform: {
    '^.+\\.(mjs|js|ts|tsx)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$':
      '@react-native/jest-preset/jest/assetFileTransformer.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|lucide-react-native|@react-native-async-storage)/)',
  ],
};
