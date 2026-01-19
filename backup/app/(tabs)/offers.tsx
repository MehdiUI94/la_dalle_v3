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
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.loadingText}>Chargement des offres...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Toutes les offres</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une offre..."
          placeholderTextColor="#9CA3AF"
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
            Toutes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'one_shot' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('one_shot')}
        >
          <Text
            style={[styles.filterText, selectedFilter === 'one_shot' && styles.filterTextActive]}
          >
            One Shot
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'permanent' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('permanent')}
        >
          <Text
            style={[styles.filterText, selectedFilter === 'permanent' && styles.filterTextActive]}
          >
            Permanentes
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
                    {offer.type === 'one_shot' ? 'One Shot' : 'Permanente'}
                  </Text>
                </View>
              </View>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              {offer.description && (
                <Text style={styles.offerDescription} numberOfLines={2}>
                  {offer.description}
                </Text>
              )}
              {offer.restaurant && (
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{offer.restaurant.name}</Text>
                  {offer.restaurant.cuisine_type && (
                    <Text style={styles.restaurantCuisine}>{offer.restaurant.cuisine_type}</Text>
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
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
    borderRadius: 20,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  filterButtonActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
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
    color: '#F97316',
    fontSize: 12,
    fontWeight: '600',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: '#D0D5DD',
    marginBottom: 12,
    lineHeight: 20,
  },
  restaurantInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#F97316',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
})

