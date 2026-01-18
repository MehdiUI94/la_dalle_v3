import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
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

export default function MapScreen() {
  const router = useRouter()
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    requestLocationPermission()
    loadRestaurants()
  }, [])

  async function requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          'La géolocalisation est nécessaire pour voir les restaurants près de vous.'
        )
        setLocation({ lat: 48.8566, lng: 2.3522 })
        setLoading(false)
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({})
      setLocation({
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
      })
    } catch (error) {
      console.error('Erreur géolocalisation:', error)
      setLocation({ lat: 48.8566, lng: 2.3522 })
    } finally {
      setLoading(false)
    }
  }

  async function loadRestaurants() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, address, lat, lng, cuisine_type, description')

      if (error) {
        console.error('Erreur:', error)
        return
      }

      if (data) {
        setRestaurants(data)
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  function handleMarkerPress(restaurant: Restaurant) {
    setSelectedRestaurant(restaurant)
  }

  function handleViewDetails() {
    if (selectedRestaurant) {
      router.push(`/restaurant-detail?restaurantId=${selectedRestaurant.id}` as any)
    }
  }

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#FF6B00" />
        <Text style={styles.logoutButtonText}>Déco</Text>
      </TouchableOpacity>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={() => setSelectedRestaurant(null)}
      >
        <Marker
          coordinate={{ latitude: location.lat, longitude: location.lng }}
          title="Vous êtes ici"
          pinColor="blue"
        />

        {restaurants.map((resto) => (
          <Marker
            key={resto.id}
            coordinate={{ latitude: resto.lat, longitude: resto.lng }}
            title={resto.name}
            description={resto.address}
            pinColor="#FF6B00"
            onPress={() => handleMarkerPress(resto)}
          />
        ))}
      </MapView>

      {selectedRestaurant && (
        <View style={styles.bottomSheet}>
          {/* Handle brutalist */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header avec nom en MAJUSCULES */}
          <View style={styles.header}>
            <Text style={styles.restaurantName}>
              {selectedRestaurant.name.toUpperCase()} 🍔
            </Text>
            {selectedRestaurant.cuisine_type && (
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{selectedRestaurant.cuisine_type.toUpperCase()}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Adresse avec icône */}
          <View style={styles.addressRow}>
            <Ionicons name="location" size={20} color="#000000" />
            <Text style={styles.address}>{selectedRestaurant.address}</Text>
          </View>

          {/* Description si présente */}
          {selectedRestaurant.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description} numberOfLines={3}>
                {selectedRestaurant.description}
              </Text>
            </View>
          )}

          {/* Bouton CTA brutalist */}
          <TouchableOpacity 
            style={styles.ctaButton} 
            onPress={handleViewDetails}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>
              VOIR LES OFFRES 🔥
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#000000',
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  logoutButtonText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000000',
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 0,
  },
  header: {
    marginBottom: 16,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 4,
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  address: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 20,
    paddingVertical: 12,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontWeight: '400',
  },
  ctaButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
})
