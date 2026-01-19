# Guide pour tester l'application sur votre téléphone

## 📱 Méthode 1 : Expo Go (Recommandé - Le plus simple)

### Étape 1 : Installer Expo Go sur votre téléphone

**Pour iOS (iPhone/iPad) :**
- Ouvrez l'App Store
- Recherchez "Expo Go"
- Installez l'application
- Ou utilisez ce lien : https://apps.apple.com/app/expo-go/id982107779

**Pour Android :**
- Ouvrez Google Play Store
- Recherchez "Expo Go"
- Installez l'application
- Ou utilisez ce lien : https://play.google.com/store/apps/details?id=host.exp.exponent

### Étape 2 : Lancer le serveur Expo

Dans votre terminal PowerShell, exécutez :
```powershell
npm start
```

Ou utilisez le script :
```powershell
.\Lancer.bat
```

### Étape 3 : Scanner le QR code

**Sur iOS (iPhone/iPad) :**
1. Ouvrez l'application **Appareil photo** native
2. Pointez vers le QR code affiché dans le terminal
3. Appuyez sur la notification qui apparaît
4. L'application s'ouvrira dans Expo Go

**Sur Android :**
1. Ouvrez l'application **Expo Go**
2. Appuyez sur "Scan QR code"
3. Scannez le QR code affiché dans le terminal

### Étape 4 : Se connecter au même réseau WiFi

⚠️ **IMPORTANT** : Votre téléphone et votre ordinateur doivent être sur le **même réseau WiFi** pour que cela fonctionne.

Si vous êtes sur des réseaux différents :
- Option A : Connectez votre téléphone au même WiFi que votre ordinateur
- Option B : Utilisez le tunnel (voir ci-dessous)

## 🌐 Méthode 2 : Tunnel (Si vous n'êtes pas sur le même WiFi)

Si votre téléphone et votre ordinateur ne sont pas sur le même réseau WiFi :

1. Dans le terminal Expo, appuyez sur **`s`** pour changer la connexion
2. Sélectionnez **"tunnel"**
3. Attendez que le tunnel se configure
4. Scannez le nouveau QR code avec Expo Go

## 🔧 Méthode 3 : Via l'adresse IP locale

Si le QR code ne fonctionne pas :

1. Dans le terminal Expo, vous verrez une adresse comme : `exp://192.168.x.x:8081`
2. Ouvrez Expo Go sur votre téléphone
3. Appuyez sur "Enter URL manually"
4. Entrez l'adresse affichée dans le terminal

## 📝 Commandes utiles dans le terminal Expo

Une fois le serveur lancé, vous pouvez utiliser :

- **`a`** - Ouvrir sur Android (émulateur)
- **`i`** - Ouvrir sur iOS (simulateur - Mac uniquement)
- **`w`** - Ouvrir sur le Web
- **`r`** - Recharger l'application
- **`m`** - Ouvrir le menu de développement
- **`s`** - Changer la connexion (LAN/Tunnel)
- **`Ctrl+C`** - Arrêter le serveur

## ⚠️ Dépannage

### Le QR code ne fonctionne pas
- Vérifiez que votre téléphone et ordinateur sont sur le même WiFi
- Essayez d'utiliser le tunnel (appuyez sur `s` dans le terminal)
- Vérifiez que le pare-feu Windows n'bloque pas le port 8081

### L'application ne se charge pas
- Vérifiez que le serveur Expo est bien lancé
- Rechargez l'application dans Expo Go (secouez le téléphone et appuyez sur "Reload")
- Vérifiez les erreurs dans le terminal

### Problèmes de connexion
- Redémarrez le serveur Expo
- Vérifiez votre connexion WiFi
- Essayez le mode tunnel

## 🎯 Note importante

Certaines fonctionnalités nécessitent un **development build** (build natif) et ne fonctionneront pas avec Expo Go :
- Le scanner de QR code (nécessite un build natif)
- Certaines fonctionnalités natives avancées

Pour ces fonctionnalités, vous devrez créer un development build avec EAS Build.
