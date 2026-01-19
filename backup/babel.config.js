module.exports = function(api) {
  api.cache(true);
  
  // Détecter si on est sur le web
  const isWeb = process.env.EXPO_PLATFORM === 'web' || 
                process.env.BABEL_ENV === 'web' ||
                (typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && typeof window !== 'undefined');
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Le plugin react-native-reanimated/plugin doit être le dernier
      // Mais seulement sur les plateformes natives (pas sur le web)
      // Sur le web, on utilise notre mock à la place
      ...(!isWeb ? ['react-native-reanimated/plugin'] : []),
    ],
  };
};
