// Version web - utilise map.web.tsx
// Sur les plateformes natives, Expo Router utilisera automatiquement index.native.tsx
import { Platform } from 'react-native'
import MapScreen from '../map.web'

export default function Index() {
  // S'assurer qu'on est bien sur le web
  if (Platform.OS === 'web') {
    return <MapScreen />
  }
  // Fallback - ne devrait jamais arriver car Expo Router utilise index.native.tsx
  return <MapScreen />
}
