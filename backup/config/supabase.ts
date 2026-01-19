import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'
import * as Linking from 'expo-linking'

// ⚠️ REMPLACEZ ces valeurs par vos vraies valeurs Supabase
// Vous les trouvez dans Supabase Dashboard > Settings > API
const supabaseUrl = 'https://cxtqbopxacvoreaxxabj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4dHFib3B4YWN2b3JlYXh4YWJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NjQ5MjQsImV4cCI6MjA4MDQ0MDkyNH0.DDzrIytVe9AWFkqsY7WgRyFy-FIQCq04YjtYLRbiiww'

// Récupérer le scheme de l'app pour les deep links
const scheme = Constants.expoConfig?.scheme || 'ladalle'
export const redirectUrl = Linking.createURL('/auth-callback')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})

// Fonction pour gérer les deep links (OAuth et confirmation d'email)
export async function handleAuthDeepLink(url: string) {
  try {
    // Extraire les paramètres de l'URL
    const parsed = Linking.parse(url)
    
    if (parsed.queryParams) {
      // Si c'est un callback OAuth ou de confirmation d'email
      if (parsed.queryParams.access_token || parsed.path === '/auth-callback') {
        const accessToken = parsed.queryParams.access_token as string
        const refreshToken = parsed.queryParams.refresh_token as string
        
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          
          if (error) {
            console.error('Erreur lors de la gestion du deep link:', error)
            return { error }
          }
          
          return { data, error: null }
        }
      }
      
      // Gérer les erreurs OAuth
      if (parsed.queryParams.error) {
        console.error('Erreur OAuth:', parsed.queryParams.error)
        return { 
          error: { 
            message: parsed.queryParams.error_description || parsed.queryParams.error 
          } 
        }
      }
    }
  } catch (err) {
    console.error('Erreur lors du parsing du deep link:', err)
    return { 
      error: { 
        message: 'Erreur lors du traitement du lien' 
      } 
    }
  }
  
  return { error: null, data: null }
}
