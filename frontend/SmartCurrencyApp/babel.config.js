module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 確保 'react-native-reanimated/plugin' 是 plugins 列表的最後一個！
      'react-native-reanimated/plugin',
    ],
  };
};