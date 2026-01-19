// Mock pour react-native-reanimated sur le web
// IMPORTANT: Ce mock doit être chargé AVANT react-native-web pour éviter les erreurs

// Sur le web, utiliser react-native-web au lieu de react-native
// Créer des composants mock qui utilisent react-native-web
const getComponent = (name: string) => {
  try {
    // Essayer d'abord react-native-web (pour le web)
    const RNW = require('react-native-web');
    if (RNW[name]) {
      return RNW[name];
    }
    // Fallback vers react-native si react-native-web n'a pas le composant
    const RN = require('react-native');
    return RN[name] || RN.View;
  } catch (e) {
    // Fallback ultime si rien n'est disponible
    const React = require('react');
    return (props: any) => {
      const elementName = name === 'ScrollView' ? 'div' : name === 'Text' ? 'span' : 'div';
      return React.createElement(elementName, { ...props, style: [{ overflow: 'auto' }, props.style] });
    };
  }
};

// Exporter les composants de base - utiliser des références directes pour éviter les problèmes
let cachedComponents: any = null;

function getCachedComponents() {
  if (!cachedComponents) {
    cachedComponents = {
      View: getComponent('View'),
      ScrollView: getComponent('ScrollView'),
      Text: getComponent('Text'),
      Image: getComponent('Image'),
      FlatList: getComponent('FlatList'),
      SectionList: getComponent('SectionList'),
    };
  }
  return cachedComponents;
}

// Exporter les composants de base de react-native-web comme mocks
export const Animated = {
  get View() { return getCachedComponents().View; },
  get ScrollView() { return getCachedComponents().ScrollView; },
  get Text() { return getCachedComponents().Text; },
  get Image() { return getCachedComponents().Image; },
  get FlatList() { return getCachedComponents().FlatList; },
  get SectionList() { return getCachedComponents().SectionList; },
  createAnimatedComponent: (component: any) => component,
}

export const useAnimatedRef = () => ({ current: null })
export const useAnimatedStyle = () => ({})
export const useScrollOffset = () => ({ value: 0 })
export const interpolate = (value: number, inputRange: number[], outputRange: number[]) => outputRange[0]
export const withTiming = (value: number) => value
export const withSpring = (value: number) => value
export const withRepeat = (value: number) => value
export const withSequence = (...values: number[]) => values[0]
export const runOnJS = (fn: Function) => fn
export const runOnUI = (fn: Function) => fn
export const useSharedValue = (initial: number) => ({ value: initial })
export const useDerivedValue = (fn: Function) => ({ value: 0 })
export const cancelAnimation = () => {}
export const withDelay = (delay: number, value: number) => value

export default Animated
