// Fichier map.tsx qui n'importe JAMAIS react-native-maps
// Ce fichier est utilisé par Expo Router pour la résolution
// Sur le web, il exporte map.web.tsx
// Sur les plateformes natives, index.native.tsx sera utilisé à la place

// IMPORTANT: Ce fichier ne doit JAMAIS importer react-native-maps
// même de manière conditionnelle, car le bundler web l'analysera quand même
export { default } from './map.web'
