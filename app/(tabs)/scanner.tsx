import { Ionicons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../../config/supabase'

// Importer le scanner uniquement si disponible
let BarCodeScanner: any = null
try {
  const barcodeScannerModule = require('expo-barcode-scanner')
  BarCodeScanner = barcodeScannerModule.BarCodeScanner
} catch (error) {
  console.warn('expo-barcode-scanner not available:', error)
}

// Vérifier si on est en Expo Go
const isExpoGo = Constants.executionEnvironment === 'storeClient'

export default function ScannerScreen() {
  const router = useRouter()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isExpoGo && BarCodeScanner) {
      requestCameraPermission()
    } else {
      setHasPermission(false)
    }
  }, [])

  async function requestCameraPermission() {
    if (!BarCodeScanner) {
      setHasPermission(false)
      return
    }

    try {
      const { status } = await BarCodeScanner.requestPermissionsAsync()
      setHasPermission(status === 'granted')
    } catch (error) {
      console.error('Erreur permission caméra:', error)
      setHasPermission(false)
    }
  }

  async function handleBarCodeScanned({ data }: { data: string }) {
    if (scanned || loading) return

    setScanned(true)
    setLoading(true)

    try {
      const qrData = JSON.parse(data)
      
      // Vérifier que les données nécessaires sont présentes
      if (!qrData.userId || !qrData.offerId || !qrData.restaurantId) {
        Alert.alert('Erreur', 'QR Code invalide')
        setScanned(false)
        setLoading(false)
        return
      }

      // Vérifier que l'utilisateur est bien connecté
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour scanner un QR Code')
        router.push('/login')
        return
      }

      // Ici, vous devriez valider le QR code avec votre backend
      // Pour l'instant, on affiche juste une confirmation
      Alert.alert(
        'QR Code scanné',
        'Offre validée avec succès !',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false)
              setLoading(false)
            },
          },
        ]
      )
    } catch (error) {
      console.error('Erreur scan:', error)
      Alert.alert('Erreur', 'Impossible de lire le QR Code')
      setScanned(false)
      setLoading(false)
    }
  }

  // Message si Expo Go ou scanner non disponible
  if (isExpoGo || !BarCodeScanner) {
    return (
      <View style={styles.container}>
        <View style={styles.expoGoContainer}>
          <Ionicons name="qr-code-outline" size={80} color="#FF6B00" />
          <Text style={styles.expoGoTitle}>SCANNER QR CODE</Text>
          <Text style={styles.expoGoMessage}>
            Le scanner de QR code nécessite un build natif et ne fonctionne pas avec Expo Go.
          </Text>
          <Text style={styles.expoGoSubMessage}>
            Pour utiliser cette fonctionnalité, vous devez créer un development build :
          </Text>
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              1. Installer EAS CLI :{' '}
              <Text style={styles.codeText}>npm install -g eas-cli</Text>
            </Text>
            <Text style={styles.instructionText}>
              2. Se connecter : <Text style={styles.codeText}>eas login</Text>
            </Text>
            <Text style={styles.instructionText}>
              3. Créer un build : <Text style={styles.codeText}>eas build --profile development</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => {
              Alert.alert(
                'Alternative temporaire',
                'En attendant, vous pouvez tester la génération de QR codes depuis les détails d\'un restaurant.'
              )
            }}
          >
            <Text style={styles.infoButtonText}>EN SAVOIR PLUS</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.message}>Demande d'autorisation caméra...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={80} color="#666666" />
        <Text style={styles.message}>Accès à la caméra refusé</Text>
        <Text style={styles.subMessage}>
          Veuillez autoriser l'accès à la caméra dans les paramètres de l'application
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>AUTORISER LA CAMÉRA</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SCANNER UN QR CODE</Text>
        <Text style={styles.subtitle}>Pointez la caméra vers le QR Code d'une offre</Text>
      </View>

      <View style={styles.scannerContainer}>
        {BarCodeScanner && (
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.scanner}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          />
        )}
        
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.loadingText}>Validation en cours...</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Placez le QR Code dans le cadre pour le scanner
        </Text>
        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>SCANNER À NOUVEAU</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const { width } = Dimensions.get('window')
const scanAreaSize = width * 0.7

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  expoGoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  expoGoTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expoGoMessage: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    fontWeight: '500',
  },
  expoGoSubMessage: {
    fontSize: 14,
    color: '#FF6B00',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  instructions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 20,
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  instructionText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  infoButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  infoButtonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FF6B00',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF6B00',
    borderWidth: 3,
    borderColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scanAgainButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  scanAgainText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  message: {
    color: '#000000',
    fontSize: 18,
    marginTop: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  subMessage: {
    color: '#666666',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
})
