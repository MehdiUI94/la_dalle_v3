// Mock pour react-native-maps sur le web
import { View, Text } from 'react-native'

export const MapView = (props: any) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F0F0' }}>
      <Text>Map non disponible sur le web</Text>
    </View>
  )
}

export const Marker = () => null
export const PROVIDER_GOOGLE = 'google'
export default MapView
