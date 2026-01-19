import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../config/supabase'

export default function QrCodeScreen() {
  const { offerId, restaurantId } = useLocalSearchParams<{
    offerId: string
    restaurantId: string
  }>()
  const router = useRouter()
  const [qrData, setQrData] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [offerTitle, setOfferTitle] = useState<string>('')

  useEffect(() => {
    if (offerId && restaurantId) {
      generateQrCode()
      loadOfferDetails()
    }
  }, [offerId, restaurantId])

  async function loadOfferDetails() {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('title')
        .eq('id', offerId)
        .single()

      if (data) {
        setOfferTitle(data.title)
      }
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  async function generateQrCode() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour utiliser une offre')
        router.back()
        return
      }

      const payload = {
        userId: user.id,
        offerId: offerId,
        restaurantId: restaurantId,
        timestamp: Date.now(),
      }

      const qrPayload = JSON.stringify(payload)
      setQrData(qrPayload)
    } catch (err) {
      console.error('Erreur:', err)
      Alert.alert('Erreur', 'Impossible de générer le QR Code')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Génération du QR Code...</Text>
      </View>
    )
  }

  if (!qrData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur lors de la génération</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>RETOUR</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>✕ FERMER</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>VOTRE QR CODE</Text>
        {offerTitle && <Text style={styles.offerTitle}>{offerTitle.toUpperCase()}</Text>}

        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>
            La génération de QR Code n'est pas disponible sur le web.
          </Text>
          <Text style={styles.webFallbackText}>
            Utilisez l'application mobile pour générer votre QR Code.
          </Text>
          <View style={styles.qrDataBox}>
            <Text style={styles.qrDataLabel}>Données du QR Code:</Text>
            <Text style={styles.qrDataText}>{qrData}</Text>
          </View>
        </View>

        <Text style={styles.instruction}>
          Présentez ce QR Code au restaurateur pour utiliser votre offre
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ⚠️ Ce QR Code est unique et valable uniquement pour cette offre
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000000',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  closeButtonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  offerTitle: {
    fontSize: 18,
    color: '#FF6B00',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '700',
  },
  webFallback: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 20,
    marginBottom: 24,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  webFallbackText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  qrDataBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#000000',
  },
  qrDataLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  qrDataText: {
    fontSize: 10,
    color: '#666666',
    fontFamily: 'monospace',
  },
  instruction: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 16,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  infoText: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  errorText: {
    color: '#000000',
    fontSize: 18,
    marginBottom: 20,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#FF6B00',
    borderWidth: 3,
    borderColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
