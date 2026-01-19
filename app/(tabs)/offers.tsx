import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../../config/supabase'

interface Offer {
  id: string
  type: 'one_shot' | 'permanent'
  title: string
  description: string | null
  is_active: boolean
  restaurant_id: string
  restaurant?: {
    id: string
    name: string
    address: string
    cuisine_type: string | null
  }
}

export default function OffersScreen() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'one_shot' | 'permanent'>('all')

  useEffect(() => {
    loadOffers()
  }, [])

  useEffect(() => {
    filterOffers()
  }, [searchQuery, selectedFilter, offers])

  async function loadOffers() {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          id,
          type,
          title,
          description,
          is_active,
          restaurant_id,
          restaurants (
            id,
            name,
            address,
            cuisine_type
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur:', error)
        return
      }

      if (data) {
        const formattedOffers = data.map((offer: any) => ({
          ...offer,
          restaurant: offer.restaurants,
        }))
        setOffers(formattedOffers)
        setFilteredOffers(formattedOffers)
      }
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  function filterOffers() {
    let filtered = [...offers]

    // Filtrer par type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((offer) => offer.type === selectedFilter)
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(query) ||
          offer.restaurant?.name.toLowerCase().includes(query) ||
          offer.restaurant?.cuisine_type?.toLowerCase().includes(query)
      )
    }

    setFilteredOffers(filtered)
  }

  function handleOfferPress(offer: Offer) {
    router.push(`/restaurant-detail?restaurantId=${offer.restaurant_id}` as any)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Chargement des offres...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TOUTES LES OFFRES</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une offre..."
          placeholderTextColor="#666666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            TOUTES
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'one_shot' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('one_shot')}
        >
          <Text
            style={[styles.filterText, selectedFilter === 'one_shot' && styles.filterTextActive]}
          >
            ONE SHOT
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'permanent' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('permanent')}
        >
          <Text
            style={[styles.filterText, selectedFilter === 'permanent' && styles.filterTextActive]}
          >
            PERMANENTES
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {filteredOffers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune offre trouvée</Text>
          </View>
        ) : (
          filteredOffers.map((offer) => (
            <TouchableOpacity
              key={offer.id}
              style={styles.offerCard}
              onPress={() => handleOfferPress(offer)}
            >
              <View style={styles.offerHeader}>
                <View style={styles.offerTypeBadge}>
                  <Text style={styles.offerTypeText}>
                    {offer.type === 'one_shot' ? '🎁' : '⭐'}
                  </Text>
                  <Text style={styles.offerTypeLabel}>
                    {offer.type === 'one_shot' ? 'ONE SHOT' : 'PERMANENTE'}
                  </Text>
                </View>
              </View>
              <Text style={styles.offerTitle}>{offer.title.toUpperCase()}</Text>
              {offer.description && (
                <Text style={styles.offerDescription} numberOfLines={2}>
                  {offer.description}
                </Text>
              )}
              {offer.restaurant && (
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{offer.restaurant.name.toUpperCase()}</Text>
                  {offer.restaurant.cuisine_type && (
                    <Text style={styles.restaurantCuisine}>{offer.restaurant.cuisine_type.toUpperCase()}</Text>
                  )}
                  <Text style={styles.restaurantAddress}>📍 {offer.restaurant.address}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 16,
    fontSize: 16,
    color: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 3,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B00',
  },
  filterText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offerTypeText: {
    fontSize: 16,
  },
  offerTypeLabel: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
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
    marginBottom: 12,
    lineHeight: 20,
  },
  restaurantInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#000000',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#FF6B00',
    marginBottom: 4,
    fontWeight: '600',
  },
  restaurantAddress: {
    fontSize: 12,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
})
