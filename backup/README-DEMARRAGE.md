# Guide de démarrage rapide - La Dalle

## ✅ Configuration automatique effectuée

Tout a été configuré automatiquement pour vous :
- ✅ Node.js installé (v24.13.0)
- ✅ npm installé (v11.6.2)
- ✅ Dépendances installées
- ✅ Profil PowerShell configuré

## 🚀 Lancer le projet

### Méthode 1 : Script batch (recommandé pour Windows)
Double-cliquez sur `demarrer.bat` ou exécutez dans PowerShell :
```powershell
.\demarrer.bat
```

### Méthode 2 : Script PowerShell
```powershell
.\start-project.ps1
```

### Méthode 3 : Commandes manuelles
Dans PowerShell, exécutez :
```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
npm start
```

## 📱 Options de lancement

Une fois le serveur Expo démarré, vous pouvez :
- Appuyer sur **`a`** pour lancer sur Android
- Appuyer sur **`i`** pour lancer sur iOS
- Appuyer sur **`w`** pour lancer sur le Web
- Scanner le **QR code** avec l'app Expo Go sur votre téléphone

## ⚠️ Note importante

Si `npm` ou `npx` n'est pas reconnu dans un nouveau terminal :
1. Redémarrez votre terminal PowerShell (pour charger le profil configuré)
2. Ou utilisez le script `demarrer.bat` qui configure automatiquement le PATH

## 🔧 Dépannage

### Node.js non reconnu
```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

### Réinstaller les dépendances
```powershell
npm install
```

### Vérifier l'installation
```powershell
node --version
npm --version
```
