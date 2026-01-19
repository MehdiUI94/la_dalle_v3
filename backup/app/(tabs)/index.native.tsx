// Version native qui utilise map.tsx depuis le dossier native (hors de app/)
// Ce fichier est utilisé automatiquement par Expo Router sur iOS et Android
import { Platform } from 'react-native'

let MapScreen: any = null

// Utiliser require() pour éviter les problèmes de résolution
if (Platform.OS !== 'web') {
  try {
    MapScreen = require('../../../native/map').default
  } catch (e) {
    console.error('Erreur chargement map native:', e)
    // Fallback vers la version web si la version native ne charge pas
    MapScreen = require('../map.web').default
  }
} else {
  MapScreen = require('../map.web').default
}

export default function Index() {
  if (!MapScreen) {
    return null
  }
  return <MapScreen />
}
