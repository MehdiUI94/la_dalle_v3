// @ts-check
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

// Charger le polyfill web en premier sur le web
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'web.js', 'web.tsx', 'web.ts']

// Bloquer complètement le dossier native/ sur le web
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  // Bloquer le dossier native/ sur le web
  new RegExp('.*[/\\\\]native[/\\\\].*'),
]

// Remplacer les modules natifs par des mocks sur le web
const originalResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Sur le web, bloquer complètement react-native-qrcode-svg et qrcode
  if (platform === 'web') {
    if (moduleName === 'react-native-qrcode-svg' || 
        moduleName === 'qrcode' ||
        moduleName.includes('qrcode/') ||
        moduleName.includes('qrcode/lib')) {
      return {
        type: 'empty',
      }
    }
    // Bloquer aussi les imports de components/qr-code-native.tsx sur le web
    if (context.originModulePath && 
        (context.originModulePath.includes('qr-code-native.tsx') || 
         context.originModulePath.includes('qr-code-native.js'))) {
      return {
        type: 'empty',
      }
    }
  }
  
  // Sur le web, remplacer react-native-maps par le mock
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'react-native-maps.web.ts'),
    }
  }
  
  // Sur le web, remplacer les modules natifs par des mocks
  if (platform === 'web') {
    // DeviceEventEmitter
    if (moduleName === 'react-native/Libraries/EventEmitter/NativeEventEmitter' || 
        moduleName === 'react-native/Libraries/vendor/emitter/EventEmitter' ||
        moduleName === 'react-native/Libraries/EventEmitter/DeviceEventEmitter' ||
        moduleName.includes('DeviceEventEmitter')) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'mocks/DeviceEventEmitter.web.ts'),
      }
    }
    
    // react-native-reanimated
    if (moduleName === 'react-native-reanimated') {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'react-native-reanimated.web.ts'),
      }
    }
  }
  
  // Bloquer toute tentative d'importer depuis native/ sur le web
  if (platform === 'web' && context.originModulePath && 
      context.originModulePath.includes('native')) {
    return {
      type: 'empty',
    }
  }
  
  // Utiliser la résolution par défaut
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform)
  }
  
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
