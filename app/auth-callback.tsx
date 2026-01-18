import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../config/supabase'

export default function AuthCallbackScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    handleAuthCallback()
  }, [])

  async function handleAuthCallback() {
    try {
      // Récupérer les fragments d'URL (access_token, refresh_token, etc.)
      const { access_token, refresh_token, type } = params

      if (access_token && refresh_token) {
        // Échanger les tokens avec Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token: access_token as string,
          refresh_token: refresh_token as string,
        })

        if (error) {
          console.error('Erreur lors de la confirmation:', error)
          setStatus('error')
          setMessage('Erreur lors de la confirmation du compte. Veuillez réessayer.')
          return
        }

        if (data.session) {
          setStatus('success')
          setMessage('Votre compte a été confirmé avec succès !')
          
          // Rediriger vers l'app après 2 secondes
          setTimeout(() => {
            router.replace('/(tabs)')
          }, 2000)
        }
      } else {
        setStatus('error')
        setMessage('Lien de confirmation invalide.')
      }
    } catch (err: any) {
      console.error('Erreur:', err)
      setStatus('error')
      setMessage('Une erreur est survenue. Veuillez réessayer.')
    }
  }

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#F97316" />
        <Text style={styles.message}>Confirmation de votre compte en cours...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {status === 'success' ? (
        <>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.title}>Compte confirmé !</Text>
          <Text style={styles.message}>{message}</Text>
        </>
      ) : (
        <>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.title}>Erreur</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/login')}
          >
            <Text style={styles.buttonText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101828',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#D0D5DD',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})

