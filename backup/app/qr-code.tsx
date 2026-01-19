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
import QRCode from 'react-native-qrcode-svg'
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
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Génération du QR Code...</Text>
      </View>
    )
  }

  if (!qrData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur lors de la génération</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>✕ Fermer</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Votre QR Code</Text>
        {offerTitle && <Text style={styles.offerTitle}>{offerTitle}</Text>}

        <View style={styles.qrContainer}>
          <QRCode
            value={qrData}
            size={250}
            color="#000000"
            backgroundColor="#FFFFFF"
            logoSize={0}
          />
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
    backgroundColor: '#101828',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#101828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  closeButtonText: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 18,
    color: '#F97316',
    marginBottom: 32,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instruction: {
    fontSize: 16,
    color: '#D0D5DD',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  infoBox: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
