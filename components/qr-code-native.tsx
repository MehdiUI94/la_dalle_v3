// Composant QR Code uniquement pour les plateformes natives
// Ce fichier ne sera JAMAIS importé sur le web
import QRCode from 'react-native-qrcode-svg'
import { View, StyleSheet } from 'react-native'

interface QRCodeNativeProps {
  value: string
  size?: number
}

export default function QRCodeNative({ value, size = 250 }: QRCodeNativeProps) {
  return (
    <View style={styles.container}>
      <QRCode
        value={value}
        size={size}
        color="#000000"
        backgroundColor="#FFFFFF"
        logoSize={0}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
})
