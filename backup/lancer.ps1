# Script de démarrage simplifié pour La Dalle
# Double-cliquez sur ce fichier ou exécutez: .\lancer.ps1

# Mettre à jour le PATH immédiatement
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# Vérifier Node.js
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Host "✓ Node.js $nodeVersion - npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js non disponible. Redémarrez votre terminal." -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

# Vérifier les dépendances
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Lancer Expo
Write-Host ""
Write-Host "Démarrage du serveur Expo..." -ForegroundColor Cyan
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Gray
Write-Host ""

npm start
