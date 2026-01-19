# Dépannage : Le QR code ne fonctionne pas

## 🔍 Vérifications à faire

### 1. Vérifier que vous êtes sur le même WiFi
- Votre téléphone et votre ordinateur doivent être sur le **même réseau WiFi**
- Vérifiez les paramètres WiFi sur les deux appareils

### 2. Vérifier le pare-feu Windows
Le pare-feu Windows peut bloquer le port 8081. Pour le vérifier :

1. Ouvrez "Pare-feu Windows Defender"
2. Cliquez sur "Paramètres avancés"
3. Vérifiez que le port 8081 n'est pas bloqué

### 3. Utiliser le mode Tunnel (Solution recommandée)

Si vous n'êtes pas sur le même WiFi ou si le QR code ne fonctionne pas :

1. Dans le terminal où Expo est lancé, appuyez sur **`s`**
2. Sélectionnez **"tunnel"** (option 2 généralement)
3. Attendez que le tunnel se configure (cela peut prendre 1-2 minutes)
4. Un nouveau QR code apparaîtra
5. Scannez ce nouveau QR code

### 4. Entrer l'URL manuellement

Si le QR code ne fonctionne toujours pas :

1. Ouvrez **Expo Go** sur votre téléphone
2. Appuyez sur **"Enter URL manually"** ou **"Entrer une URL"**
3. Dans le terminal Expo, vous verrez une URL comme :
   - `exp://192.168.x.x:8081` (mode LAN)
   - `exp://u.expo.dev/...` (mode tunnel)
4. Entrez cette URL dans Expo Go

### 5. Vérifier les erreurs dans le terminal

Regardez le terminal Expo pour voir s'il y a des erreurs :
- Erreurs de connexion réseau
- Erreurs de compilation
- Messages d'avertissement

### 6. Redémarrer le serveur Expo

Parfois, redémarrer le serveur résout le problème :

1. Dans le terminal Expo, appuyez sur **`Ctrl+C`** pour arrêter
2. Relancez avec : `npm start`
3. Attendez que le QR code apparaisse
4. Essayez de scanner à nouveau

## 🚀 Solution rapide : Mode Tunnel

La solution la plus fiable est d'utiliser le mode tunnel :

```powershell
# Dans le terminal Expo, appuyez sur 's'
# Puis sélectionnez 'tunnel'
```

Le mode tunnel fonctionne même si vous n'êtes pas sur le même WiFi, mais il nécessite une connexion Internet active.

## 📱 Alternative : Utiliser l'émulateur Android

Si vous avez Android Studio installé :

1. Lancez un émulateur Android
2. Dans le terminal Expo, appuyez sur **`a`**
3. L'application s'ouvrira automatiquement dans l'émulateur

## ⚠️ Erreurs courantes

### "Unable to connect to Metro"
- Vérifiez que le serveur Expo est bien lancé
- Vérifiez votre connexion Internet
- Essayez le mode tunnel

### "Network request failed"
- Vérifiez que vous êtes sur le même WiFi
- Vérifiez le pare-feu Windows
- Essayez le mode tunnel

### L'application se charge mais reste blanche
- Vérifiez les erreurs dans la console Expo
- Appuyez sur `r` dans le terminal pour recharger
- Secouez votre téléphone et appuyez sur "Reload" dans Expo Go
