import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../config/supabase'

interface Restaurant {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  cuisine_type: string | null
  description: string | null
}

interface Offer {
  id: string
  title: string
  description: string | null
  type: 'one_shot' | 'permanent'
  is_active: boolean
}

export default function RestaurantDetailScreen() {
  const router = useRouter()
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (restaurantId) {
      loadRestaurantDetails()
      loadOffers()
    }
  }, [restaurantId])

  async function loadRestaurantDetails() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, address, lat, lng, cuisine_type, description')
        .eq('id', restaurantId)
        .single()

      if (error) {
        console.error('Erreur:', error)
        Alert.alert('Erreur', 'Impossible de charger les détails du restaurant')
        router.back()
        return
      }

      if (data) {
        setRestaurant(data)
      }
    } catch (err) {
      console.error('Erreur:', err)
      Alert.alert('Erreur', 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  async function loadOffers() {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('id, title, description, type, is_active')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)

      if (error) {
        console.error('Erreur:', error)
        return
      }

      if (data) {
        setOffers(data)
      }
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  async function handleUseOffer(offerId: string) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour utiliser une offre')
        router.push('/login')
        return
      }

      // Naviguer vers l'écran QR code
      router.push(`/qr-code?offerId=${offerId}&restaurantId=${restaurantId}` as any)
    } catch (err) {
      console.error('Erreur:', err)
      Alert.alert('Erreur', 'Une erreur est survenue')
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  if (!restaurant) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Restaurant non trouvé</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>RETOUR</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>{restaurant.name.toUpperCase()}</Text>
      </View>

      {restaurant.cuisine_type && (
        <View style={styles.badgeContainer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{restaurant.cuisine_type.toUpperCase()}</Text>
          </View>
        </View>
      )}

      <View style={styles.addressSection}>
        <Ionicons name="location" size={20} color="#000000" />
        <Text style={styles.address}>{restaurant.address}</Text>
      </View>

      {restaurant.description && (
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>DESCRIPTION</Text>
          <Text style={styles.description}>{restaurant.description}</Text>
        </View>
      )}

      <View style={styles.offersSection}>
        <Text style={styles.offersTitle}>OFFRES DISPONIBLES</Text>
        {offers.length === 0 ? (
          <View style={styles.noOffersContainer}>
            <Text style={styles.noOffersText}>Aucune offre disponible pour ce restaurant</Text>
          </View>
        ) : (
          offers.map((offer) => (
            <TouchableOpacity
              key={offer.id}
              style={styles.offerCard}
              onPress={() => handleUseOffer(offer.id)}
            >
              <View style={styles.offerHeader}>
                <Text style={styles.offerType}>
                  {offer.type === 'one_shot' ? '🎁 ONE SHOT' : '⭐ PERMANENTE'}
                </Text>
              </View>
              <Text style={styles.offerTitle}>{offer.title.toUpperCase()}</Text>
              {offer.description && (
                <Text style={styles.offerDescription} numberOfLines={2}>
                  {offer.description}
                </Text>
              )}
              <View style={styles.offerFooter}>
                <Text style={styles.useOfferText}>UTILISER L'OFFRE →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    flex: 1,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    transform: [{ rotate: '-2deg' }],
  },
  badgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    gap: 8,
  },
  address: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  descriptionSection: {
    marginBottom: 32,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  offersSection: {
    marginTop: 8,
  },
  offersTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  noOffersContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noOffersText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  offerHeader: {
    marginBottom: 12,
  },
  offerType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B00',
    letterSpacing: 0.5,
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  offerDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  offerFooter: {
    borderTopWidth: 2,
    borderTopColor: '#000000',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  useOfferText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF6B00',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
})
