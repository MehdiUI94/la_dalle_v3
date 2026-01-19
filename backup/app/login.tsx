import DateTimePicker from '@react-native-community/datetimepicker'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { supabase } from '../config/supabase'

// Fermer le WebBrowser quand il se ferme automatiquement
// WebBrowser.maybeCompleteAuthSession() // This line is removed as per the new_code, as the OAuth flow is no longer directly used.

// Fonction pour traduire les messages d'erreur Supabase en français
function translateError(errorMessage: string): string {
  const errorTranslations: { [key: string]: string } = {
    'Invalid login credentials': 'Email ou mot de passe incorrect',
    'Email not confirmed': 'Email non confirmé',
    'User already registered': 'Cet email est déjà utilisé',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    'Invalid email': 'Adresse email invalide',
    'Email rate limit exceeded': 'Trop de tentatives. Réessaye plus tard',
    'User not found': 'Aucun compte trouvé avec cet email',
    'Signup is disabled': 'Les inscriptions sont temporairement désactivées',
    'Email already confirmed': 'Cet email est déjà confirmé',
  }

  for (const [english, french] of Object.entries(errorTranslations)) {
    if (errorMessage.toLowerCase().includes(english.toLowerCase())) {
      return french
    }
  }

  return errorMessage
}

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState(new Date(2000, 0, 1))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  function calculateAge(birthDate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  async function resendConfirmationEmail() {
    if (!email) {
      Alert.alert('Erreur', 'Entre ton email pour recevoir le lien de confirmation')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Adresse email invalide')
      return
    }

    setResendLoading(true)

    try {
      const scheme = Constants.expoConfig?.scheme || 'ladalle'
      const redirectUrl = Linking.createURL('/auth-callback')

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      })

      if (error) {
        Alert.alert('Erreur', translateError(error.message))
        setResendLoading(false)
        return
      }

      Alert.alert(
        'Email envoyé ! 📧',
        'Un nouveau lien de confirmation a été envoyé à ' + email + '. Vérifie ta boîte (et tes spams) !',
        [{ text: 'OK' }]
      )
    } catch (err: any) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'envoi de l\'email')
    } finally {
      setResendLoading(false)
    }
  }

  async function handleAuth() {
    // Validation des champs obligatoires
    if (!email || !password) {
      Alert.alert('Erreur', 'Remplis tous les champs obligatoires')
      return
    }

    if (isSignUp) {
      if (!firstName || !lastName) {
        Alert.alert('Erreur', 'Remplis ton prénom et ton nom')
        return
      }

      const age = calculateAge(birthDate)
      if (age < 13) {
        Alert.alert('Erreur', 'Tu dois avoir au moins 13 ans pour t\'inscrire')
        return
      }
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Adresse email invalide')
      return
    }

    // Validation mot de passe
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)
    setShowEmailVerification(false)

    try {
      if (isSignUp) {
        // Inscription
        const scheme = Constants.expoConfig?.scheme || 'ladalle'
        const redirectUrl = Linking.createURL('/auth-callback')
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name: firstName,
              last_name: lastName,
              birth_date: birthDate.toISOString().split('T')[0],
            },
          },
        })

        if (error) {
          Alert.alert('Erreur', translateError(error.message))
          setLoading(false)
          return
        }

        if (data.user && !data.session) {
          // Email de confirmation envoyé
          setShowEmailVerification(true)
          Alert.alert(
            'Compte créé ! 🎉',
            'Un email de confirmation a été envoyé à ' + email + '. Vérifie ta boîte (et tes spams) et clique sur le lien pour activer ton compte.',
            [{ text: 'OK' }]
          )
        } else if (data.session) {
          Alert.alert(
            'Compte créé ! 🎉',
            'Ton compte a été créé avec succès.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setIsSignUp(false)
                  setFirstName('')
                  setLastName('')
                  setBirthDate(new Date(2000, 0, 1))
                  router.replace('/(tabs)')
                },
              },
            ]
          )
        }
      } else {
        // Connexion
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          // Vérifier si c'est une erreur d'email non confirmé
          if (error.message.toLowerCase().includes('email not confirmed') || 
              error.message.toLowerCase().includes('email_not_confirmed')) {
            setShowEmailVerification(true)
            Alert.alert(
              'Email non confirmé ⚠️',
              'Tu dois d\'abord confirmer ton email. Clique sur "Renvoyer l\'email" ci-dessous pour recevoir un nouveau lien.',
              [{ text: 'OK' }]
            )
          } else {
            Alert.alert('Erreur', translateError(error.message))
          }
          setLoading(false)
          return
        }

        if (data.session) {
          router.replace('/(tabs)')
        }
      }
    } catch (err: any) {
      Alert.alert('Erreur', translateError(err.message) || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            {isSignUp ? 'CRÉER UN COMPTE 🍔' : 'CONNEXION 🔥'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp
              ? 'Rejoins LA DALLE et mange comme un roi 👑'
              : 'Connecte-toi pour accéder aux offres'}
          </Text>

          <View style={styles.form}>
            {isSignUp && (
              <>
                <Text style={styles.label}>PRÉNOM</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ton prénom"
                  placeholderTextColor="#666666"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading && !resendLoading}
                />

                <Text style={styles.label}>NOM</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ton nom"
                  placeholderTextColor="#666666"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!loading && !resendLoading}
                />

                <Text style={styles.label}>DATE DE NAISSANCE</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowDatePicker(true)}
                  disabled={loading || resendLoading}
                >
                  <Text style={[styles.dateText, !birthDate && styles.placeholder]}>
                    {birthDate ? formatDate(birthDate) : 'JJ/MM/AAAA'}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios')
                      if (selectedDate) {
                        setBirthDate(selectedDate)
                      }
                    }}
                    maximumDate={new Date()}
                    minimumDate={new Date(1920, 0, 1)}
                  />
                )}
              </>
            )}

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="ton@email.com"
              placeholderTextColor="#666666"
              value={email}
              onChangeText={(text) => {
                setEmail(text)
                setShowEmailVerification(false)
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!loading && !resendLoading}
            />

            <Text style={styles.label}>MOT DE PASSE</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 6 caractères"
              placeholderTextColor="#666666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              editable={!loading && !resendLoading}
            />

            {/* Message de vérification d'email */}
            {showEmailVerification && (
              <View style={styles.verificationCard}>
                <Text style={styles.verificationTitle}>VÉRIFIE TON EMAIL 📧</Text>
                <Text style={styles.verificationText}>
                  Un lien de confirmation a été envoyé à {email}
                </Text>
                <Text style={styles.verificationSubtext}>
                  Clique sur le lien dans l'email pour activer ton compte. Vérifie aussi tes spams !
                </Text>
                <TouchableOpacity
                  style={[styles.resendButton, resendLoading && styles.resendButtonDisabled]}
                  onPress={resendConfirmationEmail}
                  disabled={resendLoading || loading}
                  activeOpacity={0.9}
                >
                  {resendLoading ? (
                    <ActivityIndicator color="#000000" />
                  ) : (
                    <Text style={styles.resendButtonText}>RENVOYER L'EMAIL 🔄</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, (loading || resendLoading) && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading || resendLoading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? "S'INSCRIRE 🚀" : 'SE CONNECTER 🔥'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                setIsSignUp(!isSignUp)
                setShowEmailVerification(false)
                setFirstName('')
                setLastName('')
                setBirthDate(new Date(2000, 0, 1))
              }}
              disabled={loading || resendLoading}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? 'Déjà un compte ? Se connecter'
                  : "Pas encore de compte ? S'inscrire"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 16,
    fontSize: 16,
    color: '#000000',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  dateText: {
    fontSize: 16,
    color: '#000000',
  },
  placeholder: {
    color: '#666666',
  },
  verificationCard: {
    backgroundColor: '#FFE500',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verificationText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '600',
  },
  verificationSubtext: {
    fontSize: 13,
    color: '#000000',
    marginBottom: 16,
    fontWeight: '400',
  },
  resendButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  button: {
    backgroundColor: '#FF6B00',
    borderWidth: 3,
    borderColor: '#000000',
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})
