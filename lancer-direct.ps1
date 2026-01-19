# Script qui contourne la politique d'exécution en exécutant directement les commandes
# Utilisez: powershell -ExecutionPolicy Bypass -File lancer-direct.ps1

# Mettre à jour le PATH
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# Vérifier Node.js
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Host "✓ Node.js $nodeVersion - npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js non disponible" -ForegroundColor Red
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
