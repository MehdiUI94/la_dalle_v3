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
          <Ionicons name="qr-code-outline" size={80} color="#F97316" />
          <Text style={styles.expoGoTitle}>Scanner QR Code</Text>
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
            <Text style={styles.infoButtonText}>En savoir plus</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.message}>Demande d'autorisation caméra...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={80} color="#9CA3AF" />
        <Text style={styles.message}>Accès à la caméra refusé</Text>
        <Text style={styles.subMessage}>
          Veuillez autoriser l'accès à la caméra dans les paramètres de l'application
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scanner un QR Code</Text>
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
            <ActivityIndicator size="large" color="#F97316" />
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
            <Text style={styles.scanAgainText}>Scanner à nouveau</Text>
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
    backgroundColor: '#101828',
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
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  expoGoMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  expoGoSubMessage: {
    fontSize: 14,
    color: '#F97316',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#1F2937',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  instructionText: {
    fontSize: 14,
    color: '#D0D5DD',
    marginBottom: 12,
    lineHeight: 20,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#374151',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#F97316',
  },
  infoButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  infoButtonText: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
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
    borderColor: '#F97316',
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
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scanAgainButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F97316',
  },
  scanAgainText: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '600',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 24,
    textAlign: 'center',
  },
  subMessage: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
})
